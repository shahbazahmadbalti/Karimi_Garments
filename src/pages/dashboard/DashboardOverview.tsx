import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { data: dashboardData } = trpc.admin.dashboard.useQuery();

  const stats = [
    {
      label: "Total Revenue",
      value: `$${Number(dashboardData?.stats.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-700",
      trend: "+12%",
    },
    {
      label: "Total Orders",
      value: dashboardData?.stats.totalOrders?.toString() || "0",
      icon: ShoppingBag,
      color: "bg-blue-100 text-blue-700",
      trend: "+8%",
    },
    {
      label: "Pending Orders",
      value: dashboardData?.stats.pendingOrders?.toString() || "0",
      icon: AlertTriangle,
      color: "bg-yellow-100 text-yellow-700",
      trend: "Action needed",
    },
    {
      label: "Total Customers",
      value: dashboardData?.stats.totalUsers?.toString() || "0",
      icon: Users,
      color: "bg-purple-100 text-purple-700",
      trend: "+15%",
    },
    {
      label: "Products",
      value: dashboardData?.stats.totalProducts?.toString() || "0",
      icon: Package,
      color: "bg-gray-100 text-gray-700",
      trend: "Active",
    },
    {
      label: "Low Stock",
      value: dashboardData?.stats.lowStockCount?.toString() || "0",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-700",
      trend: "Needs attention",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              if (stat.label === "Products" || stat.label === "Low Stock")
                navigate("/dashboard/products");
              else if (stat.label.includes("Orders")) navigate("/dashboard/orders");
              else if (stat.label === "Total Customers") navigate("/dashboard/users");
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.trend}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Recent Orders</h3>
            <button
              onClick={() => navigate("/dashboard/orders")}
              className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData?.recentOrders?.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">${Number(order.total).toFixed(2)}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            )) || <p className="text-gray-500 text-sm">No recent orders</p>}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Top Products</h3>
            <button
              onClick={() => navigate("/dashboard/products")}
              className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Manage <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData?.topProducts?.map((product, i) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="font-medium text-sm line-clamp-1">
                    {product.productName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{product.totalSold} sold</p>
                  <p className="text-xs text-gray-500">
                    ${Number(product.revenue).toFixed(2)}
                  </p>
                </div>
              </div>
            )) || <p className="text-gray-500 text-sm">No sales data yet</p>}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {dashboardData?.lowStockProducts && dashboardData.lowStockProducts.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-red-100 p-6">
          <h3 className="font-bold text-lg mb-4 text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Low Stock Alerts
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dashboardData.lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-red-50 rounded-lg"
              >
                <img
                  src={product.featuredImage || "/placeholder.svg"}
                  alt={product.name}
                  className="w-10 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-red-600">
                    Only {product.stockQuantity} left (threshold: {product.lowStockThreshold})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
