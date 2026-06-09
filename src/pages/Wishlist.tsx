import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";

export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const { data: wishlistItems, isLoading } = trpc.wishlist.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const utils = trpc.useUtils();
  const removeMutation = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      utils.wishlist.list.invalidate();
      toast.success("Removed from wishlist");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please Sign In</h2>
        <p className="text-gray-500 mb-6">Sign in to view your wishlist.</p>
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-6">Save items you love to your wishlist.</p>
        <Button onClick={() => navigate("/products")}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist ({wishlistItems.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src={item.product.featuredImage || "/placeholder.svg"}
                alt={item.product.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => navigate(`/products/${item.product.slug}`)}
              />
              <button
                onClick={() => removeMutation.mutate({ id: item.id })}
                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
            <div className="p-4">
              <h3
                className="font-medium text-sm mb-1 line-clamp-1 cursor-pointer hover:text-amber-600"
                onClick={() => navigate(`/products/${item.product.slug}`)}
              >
                {item.product.name}
              </h3>
              <p className="font-bold mb-3">${Number(item.product.price).toFixed(2)}</p>
              <Button
                size="sm"
                className="w-full bg-black hover:bg-gray-800"
                onClick={() => {
                  addItem(item.product);
                  toast.success("Added to cart!");
                }}
              >
                <ShoppingBag className="w-3 h-3 mr-1" />
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
