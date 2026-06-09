import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Image, Plus, Trash2 } from "lucide-react";

export default function BannersManager() {
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "/products",
    buttonText: "Shop Now",
    position: "hero" as const,
    sortOrder: 0,
  });

  const { data: banners, isLoading } = trpc.banner.listAll.useQuery();

  const createMutation = trpc.banner.create.useMutation({
    onSuccess: () => {
      toast.success("Banner created!");
      utils.banner.listAll.invalidate();
      setShowForm(false);
      setFormData({ title: "", subtitle: "", image: "", link: "/products", buttonText: "Shop Now", position: "hero", sortOrder: 0 });
    },
  });

  const deleteMutation = trpc.banner.delete.useMutation({
    onSuccess: () => {
      toast.success("Banner deleted!");
      utils.banner.listAll.invalidate();
    },
  });

  const toggleMutation = trpc.banner.update.useMutation({
    onSuccess: () => {
      utils.banner.listAll.invalidate();
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Banners</h2>
        <Button onClick={() => setShowForm(true)} className="bg-black hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-1" />
          Add Banner
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-bold mb-4">New Banner</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(formData);
            }}
            className="grid md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Image URL *</label>
              <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Subtitle</label>
              <Input value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Link</label>
              <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Button Text</label>
              <Input value={formData.buttonText} onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" disabled={createMutation.isPending}>Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners?.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl border overflow-hidden">
              <img src={banner.image} alt={banner.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{banner.title}</h4>
                    <Badge variant="outline" className="mt-1 capitalize">{banner.position}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleMutation.mutate({ id: banner.id, isActive: !banner.isActive })}
                      className="p-1.5 hover:bg-gray-100 rounded"
                      title={banner.isActive ? "Deactivate" : "Activate"}
                    >
                      <Badge className={banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this banner?")) deleteMutation.mutate({ id: banner.id });
                      }}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!banners || banners.length === 0) && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              No banners yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
