import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
} from "lucide-react";

export default function Account() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const { data: orders } = trpc.order.list.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: wishlistItems } = trpc.wishlist.list.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: addresses } = trpc.address.list.useQuery(undefined, {
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      processing: "bg-purple-100 text-purple-700",
      shipped: "bg-indigo-100 text-indigo-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      refunded: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl p-6 sticky top-32">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <h2 className="font-bold">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <Badge variant="outline" className="mt-2 capitalize">
                {user.role}
              </Badge>
            </div>
            <nav className="space-y-1">
              {[
                { icon: Package, label: "My Orders", value: "orders" },
                { icon: Heart, label: "Wishlist", value: "wishlist" },
                { icon: MapPin, label: "Addresses", value: "addresses" },
                { icon: User, label: "Profile", value: "profile" },
              ].map((item) => (
                <button
                  key={item.value}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors text-left"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="orders">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="orders">
                <Package className="w-4 h-4 mr-1" />
                Orders ({orders?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="wishlist">
                <Heart className="w-4 h-4 mr-1" />
                Wishlist ({wishlistItems?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="addresses">
                <MapPin className="w-4 h-4 mr-1" />
                Addresses ({addresses?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-1" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <h3 className="text-xl font-bold mb-4">My Orders</h3>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border rounded-xl p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 mb-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <img
                              src={item.productImage || "/placeholder.svg"}
                              alt={item.productName}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div>
                              <p className="text-sm font-medium">{item.productName}</p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity} x ${Number(item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t pt-4">
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-bold">${Number(order.total).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {order.trackingNumber && (
                            <p className="text-xs text-gray-500">
                              Tracking: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No orders yet</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/products")}
                  >
                    Start Shopping
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="wishlist">
              <h3 className="text-xl font-bold mb-4">My Wishlist</h3>
              {wishlistItems && wishlistItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/products/${item.product.slug}`)}
                    >
                      <img
                        src={item.product.featuredImage || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-full aspect-[3/4] object-cover"
                      />
                      <div className="p-3">
                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                        <p className="font-bold text-sm">${Number(item.product.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="addresses">
              <h3 className="text-xl font-bold mb-4">My Addresses</h3>
              {addresses && addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white border rounded-xl p-4 flex justify-between items-start"
                    >
                      <div>
                        <p className="font-medium">
                          {addr.firstName} {addr.lastName}
                          {addr.isDefault && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {addr.address1}
                          {addr.address2 && `, ${addr.address2}`}
                          <br />
                          {addr.city}, {addr.state} {addr.postalCode}
                          <br />
                          {addr.country}
                        </p>
                        {addr.phone && <p className="text-sm text-gray-500">{addr.phone}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No saved addresses</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile">
              <h3 className="text-xl font-bold mb-4">Profile Information</h3>
              <div className="bg-white border rounded-xl p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="font-medium">{user.name || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="font-medium">{user.email || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role</label>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                    <p className="font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
