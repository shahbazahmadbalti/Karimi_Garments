import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Star,
  SlidersHorizontal,
  X,
  Grid3X3,
  LayoutList,
} from "lucide-react";

export default function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: categories } = trpc.category.list.useQuery();
  const { data: productsData, isLoading } = trpc.product.list.useQuery({
    categoryId: selectedCategory,
    search: search || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort: sort as any,
    limit: 24,
  });

  useEffect(() => {
    const categorySlug = searchParams.get("category");
    if (categorySlug && categories) {
      const cat = categories.find((c) => c.slug === categorySlug);
      if (cat) setSelectedCategory(cat.id);
    }
  }, [searchParams, categories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(undefined);
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Products</h1>
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-10"
            />
          </form>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="name_asc">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
            <div className="hidden sm:flex border rounded-md">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-gray-100" : ""}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-gray-100" : ""}`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="bg-gray-50 rounded-lg p-4 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={() => setShowFilters(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select
                value={selectedCategory?.toString() || ""}
                onValueChange={(v) => setSelectedCategory(v ? Number(v) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Min Price</label>
              <Input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Max Price</label>
              <Input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="999"
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear All
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Showing {productsData?.items.length || 0} of {productsData?.total || 0} products
          </p>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {productsData?.items.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div
                    className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/products/${product.slug}`)}
                  >
                    <img
                      src={product.featuredImage || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.isNewArrival && (
                      <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(product);
                      }}
                      className="absolute bottom-2 right-2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3
                      className="font-medium text-sm mb-1 line-clamp-1 cursor-pointer hover:text-amber-600"
                      onClick={() => navigate(`/products/${product.slug}`)}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-gray-400 text-xs line-through">
                          ${Number(product.compareAtPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span className="text-xs text-gray-500">{product.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {productsData?.items.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
                >
                  <img
                    src={product.featuredImage || "/placeholder.svg"}
                    alt={product.name}
                    className="w-32 h-40 object-cover rounded-lg cursor-pointer"
                    onClick={() => navigate(`/products/${product.slug}`)}
                  />
                  <div className="flex-1">
                    <h3
                      className="font-bold mb-1 cursor-pointer hover:text-amber-600"
                      onClick={() => navigate(`/products/${product.slug}`)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-2">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold">${Number(product.price).toFixed(2)}</span>
                      {product.compareAtPrice && (
                        <span className="text-gray-400 text-sm line-through">
                          ${Number(product.compareAtPrice).toFixed(2)}
                        </span>
                      )}
                      <div className="flex items-center gap-1 ml-2">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs text-gray-500">{product.rating} ({product.reviewCount})</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addItem(product)}
                      className="bg-black hover:bg-gray-800"
                    >
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {productsData?.items.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
