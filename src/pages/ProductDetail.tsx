import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  Shield,
  RefreshCcw,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const { data: product, isLoading } = trpc.product.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );
  const { data: reviews } = trpc.review.listByProduct.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product }
  );
  const { data: relatedProducts } = trpc.product.related.useQuery(
    {
      productId: product?.id || 0,
      categoryId: product?.categoryId || 0,
      limit: 4,
    },
    { enabled: !!product }
  );

  const wishlistMutation = trpc.wishlist.toggle.useMutation({
    onSuccess: (data) => {
      toast.success(data.isWishlisted ? "Added to wishlist" : "Removed from wishlist");
    },
  });
  const reviewMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      toast.success("Review submitted!");
      setReviewRating(5);
      setReviewComment("");
    },
  });

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Button onClick={() => navigate("/products")}>Browse Products</Button>
      </div>
    );
  }

  const images = [product.featuredImage, ...(product.images || [])].filter(Boolean) as string[];
  const sizes = (product.sizes as string[] | null) || ["S", "M", "L", "XL", "XXL"];
  const colors = (product.colors as string[] | null) || [];
  const savings = product.compareAtPrice
    ? Number(product.compareAtPrice) - Number(product.price)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    toast.success("Added to cart!");
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add to wishlist");
      return;
    }
    wishlistMutation.mutate({ productId: product.id });
  };

  const handleReview = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to leave a review");
      return;
    }
    reviewMutation.mutate({
      productId: product.id,
      rating: reviewRating,
      comment: reviewComment,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => navigate("/")} className="hover:text-black">Home</button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate("/products")} className="hover:text-black">Products</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-black">{product.name}</span>
      </div>

      {/* Product Info */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            <img
              src={images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? "border-black" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {product.isNewArrival && (
            <span className="inline-block bg-black text-white text-xs px-2 py-1 rounded mb-3">
              NEW ARRIVAL
            </span>
          )}
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              <span className="font-medium">{product.rating}</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">{reviews?.length || 0} reviews</span>
            <span className="text-gray-400">|</span>
            <span className={`text-sm ${product.stockQuantity > 0 ? "text-green-600" : "text-red-600"}`}>
              {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : "Out of Stock"}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold">${Number(product.price).toFixed(2)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  ${Number(product.compareAtPrice).toFixed(2)}
                </span>
                {savings > 0 && (
                  <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                    Save ${savings.toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>

          <p className="text-gray-600 mb-6">{product.shortDescription}</p>

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Size</label>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg border-2 font-medium transition-colors ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      selectedColor === color
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <Button
              size="lg"
              className="flex-1 bg-black hover:bg-gray-800"
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-300"
              onClick={handleWishlist}
            >
              <Heart className="w-5 h-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Truck, label: "Free Shipping" },
              { icon: Shield, label: "Secure Payment" },
              { icon: RefreshCcw, label: "Easy Returns" },
            ].map((f) => (
              <div key={f.label} className="p-3 bg-gray-50 rounded-lg">
                <f.icon className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <p className="text-xs text-gray-600">{f.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mb-16">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-6">
          <div className="max-w-3xl text-gray-600 leading-relaxed">
            {product.description || "No description available."}
          </div>
        </TabsContent>
        <TabsContent value="details" className="mt-6">
          <div className="max-w-3xl">
            <table className="w-full text-sm">
              <tbody>
                {[
                  { label: "SKU", value: product.sku },
                  { label: "Material", value: product.material || "N/A" },
                  { label: "Weight", value: product.weight ? `${product.weight} kg` : "N/A" },
                  { label: "Care Instructions", value: product.careInstructions || "Machine wash cold" },
                  { label: "Stock", value: `${product.stockQuantity} units` },
                ].map((row) => (
                  <tr key={row.label} className="border-b">
                    <td className="py-3 font-medium w-1/3">{row.label}</td>
                    <td className="py-3 text-gray-600">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="mt-6">
          <div className="max-w-3xl">
            {/* Write Review */}
            {isAuthenticated && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-bold mb-3">Write a Review</h4>
                <div className="mb-3">
                  <label className="text-sm font-medium mb-1 block">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating
                              ? "fill-amber-500 text-amber-500"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-3 border rounded-lg mb-3 text-sm"
                  rows={3}
                />
                <Button size="sm" onClick={handleReview} disabled={reviewMutation.isPending}>
                  Submit Review
                </Button>
              </div>
            )}

            {/* Reviews List */}
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.userName}</span>
                      <span className="text-gray-400 text-xs">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rp) => (
              <div
                key={rp.id}
                className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/products/${rp.slug}`)}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={rp.featuredImage || "/placeholder.svg"}
                    alt={rp.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-1">{rp.name}</h3>
                  <p className="font-bold text-sm mt-1">${Number(rp.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
