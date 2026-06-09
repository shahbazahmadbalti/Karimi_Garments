import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, Package } from "lucide-react";

export default function ProductsManager() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    shortDescription: "",
    categoryId: 1,
    price: "",
    compareAtPrice: "",
    stockQuantity: "0",
    material: "",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Navy"],
    featuredImage: "",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
  });

  const { data: productsData, isLoading } = trpc.product.list.useQuery({
    search: search || undefined,
    limit: 50,
  });
  const { data: categories } = trpc.category.list.useQuery();

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      toast.success("Product created!");
      utils.product.list.invalidate();
      resetForm();
    },
  });

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated!");
      utils.product.list.invalidate();
      resetForm();
    },
  });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted!");
      utils.product.list.invalidate();
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: "", slug: "", sku: "", description: "", shortDescription: "",
      categoryId: 1, price: "", compareAtPrice: "", stockQuantity: "0",
      material: "", sizes: ["S", "M", "L", "XL"], colors: ["Black", "White", "Navy"],
      featuredImage: "", isFeatured: false, isNewArrival: false, isBestSeller: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: formData.price,
      compareAtPrice: formData.compareAtPrice || undefined,
      stockQuantity: Number(formData.stockQuantity),
      sizes: formData.sizes,
      colors: formData.colors,
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct, ...data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      categoryId: product.categoryId,
      price: product.price,
      compareAtPrice: product.compareAtPrice || "",
      stockQuantity: product.stockQuantity.toString(),
      material: product.material || "",
      sizes: (product.sizes as string[]) || ["S", "M", "L", "XL"],
      colors: (product.colors as string[]) || ["Black", "White", "Navy"],
      featuredImage: product.featuredImage || "",
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-black hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-bold mb-4">
            {editingProduct ? "Edit Product" : "New Product"}
          </h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            {[
              { key: "name", label: "Name", required: true },
              { key: "slug", label: "Slug", required: true },
              { key: "sku", label: "SKU", required: true },
              { key: "price", label: "Price", type: "number", required: true },
              { key: "compareAtPrice", label: "Compare at Price", type: "number" },
              { key: "stockQuantity", label: "Stock Quantity", type: "number" },
              { key: "material", label: "Material" },
              { key: "featuredImage", label: "Image URL" },
            ].map((field) => (
              <div key={field.key} className={field.key === "name" || field.key === "slug" ? "" : ""}>
                <label className="text-sm font-medium mb-1 block">{field.label}</label>
                <Input
                  type={field.type || "text"}
                  value={(formData as any)[field.key]}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  required={field.required}
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex gap-4">
              {["isFeatured", "isNewArrival", "isBestSeller"].map((field) => (
                <label key={field} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(formData as any)[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.checked })}
                    className="rounded"
                  />
                  {field.replace("is", "")}
                </label>
              ))}
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingProduct ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 font-medium">Price</th>
                  <th className="text-left px-4 py-3 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsData?.items.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.featuredImage || "/placeholder.svg"}
                          alt={product.name}
                          className="w-10 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <div className="flex gap-1 mt-0.5">
                            {product.isFeatured && <Badge variant="outline" className="text-xs">Featured</Badge>}
                            {product.isNewArrival && <Badge variant="outline" className="text-xs">New</Badge>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                    <td className="px-4 py-3 font-medium">${Number(product.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={product.stockQuantity <= product.lowStockThreshold ? "text-red-600" : "text-green-600"}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(product)} className="p-1.5 hover:bg-gray-100 rounded">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this product?")) deleteMutation.mutate({ id: product.id });
                          }}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!productsData?.items || productsData.items.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
