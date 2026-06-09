import { useState } from "react";
import { useNavigate } from "react-router";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CreditCard, Truck, Check } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [step, setStep] = useState<"shipping" | "payment" | "confirm">("shipping");
  const [shippingData, setShippingData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Afghanistan",
  });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe">("cod");

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Order placed! Order #${data.orderNumber}`);
      clearCart();
      navigate("/account");
    },
    onError: () => {
      toast.error("Failed to place order");
    },
  });

  const validateCoupon = trpc.coupon.validate.useQuery(
    { code: couponCode },
    { enabled: false }
  );

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <p className="text-gray-500 mb-6">You need to be signed in to complete checkout.</p>
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate("/products")}>Browse Products</Button>
      </div>
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    const result = await validateCoupon.refetch();
    if (result.data?.valid && result.data.coupon) {
      const coupon = result.data.coupon;
      let disc = 0;
      if (coupon.discountType === "percentage") {
        disc = (total * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && disc > Number(coupon.maxDiscount)) {
          disc = Number(coupon.maxDiscount);
        }
      } else {
        disc = Number(coupon.discountValue);
      }
      setDiscount(disc);
      toast.success(`Coupon applied! You saved $${disc.toFixed(2)}`);
    } else {
      toast.error(result.data?.message || "Invalid coupon");
    }
  };

  const handlePlaceOrder = () => {
    createOrder.mutate({
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.featuredImage || undefined,
        price: Number(item.product.price),
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      subtotal: total,
      shippingCost: 0,
      tax: 0,
      discount,
      total: total - discount,
      paymentMethod,
      couponCode: couponCode || undefined,
    });
  };

  const finalTotal = total - discount;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { key: "shipping", label: "Shipping" },
          { key: "payment", label: "Payment" },
          { key: "confirm", label: "Confirm" },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s.key
                  ? "bg-black text-white"
                  : i < ["shipping", "payment", "confirm"].indexOf(step)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < ["shipping", "payment", "confirm"].indexOf(step) ? (
                <Check className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            <span className="text-sm font-medium">{s.label}</span>
            {i < 2 && <div className="w-12 h-0.5 bg-gray-200 ml-2" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === "shipping" && (
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { key: "firstName", label: "First Name" },
                  { key: "lastName", label: "Last Name" },
                  { key: "email", label: "Email", type: "email" },
                  { key: "phone", label: "Phone" },
                  { key: "address1", label: "Address Line 1" },
                  { key: "address2", label: "Address Line 2 (Optional)" },
                  { key: "city", label: "City" },
                  { key: "state", label: "State/Province" },
                  { key: "postalCode", label: "Postal Code" },
                ].map((field) => (
                  <div key={field.key} className={field.key === "address1" || field.key === "address2" ? "md:col-span-2" : ""}>
                    <label className="text-sm font-medium mb-1 block">{field.label}</label>
                    <Input
                      type={field.type || "text"}
                      value={(shippingData as any)[field.key]}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, [field.key]: e.target.value })
                      }
                      required={field.key !== "address2"}
                    />
                  </div>
                ))}
              </div>
              <Button
                className="mt-6 bg-black hover:bg-gray-800"
                onClick={() => setStep("payment")}
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                    paymentMethod === "cod" ? "border-black" : "border-gray-200"
                  }`}
                >
                  <Truck className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive</p>
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod("stripe")}
                  className={`w-full p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                    paymentMethod === "stripe" ? "border-black" : "border-gray-200"
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Credit/Debit Card (Stripe)</p>
                    <p className="text-sm text-gray-500">Secure online payment</p>
                  </div>
                </button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("shipping")}>
                  Back
                </Button>
                <Button
                  className="bg-black hover:bg-gray-800"
                  onClick={() => setStep("confirm")}
                >
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Order Confirmation</h2>
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Shipping To:</h4>
                  <p className="text-sm text-gray-600">
                    {shippingData.firstName} {shippingData.lastName}<br />
                    {shippingData.address1}<br />
                    {shippingData.address2 && <>{shippingData.address2}<br /></>}
                    {shippingData.city}, {shippingData.state} {shippingData.postalCode}<br />
                    {shippingData.email} | {shippingData.phone}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Payment:</h4>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === "cod" ? "Cash on Delivery" : "Credit/Debit Card"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("payment")}>
                  Back
                </Button>
                <Button
                  className="bg-black hover:bg-gray-800"
                  onClick={handlePlaceOrder}
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-gray-50 rounded-xl p-6 sticky top-32">
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.product.featuredImage || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-medium">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button variant="outline" onClick={handleApplyCoupon}>
                Apply
              </Button>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
