import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { BarChart3, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: dashboard } = trpc.admin.dashboard.useQuery();
  const { data: salesReport } = trpc.admin.salesReport.useQuery(dateRange);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="border rounded-md px-3 py-1.5 text-sm"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="border rounded-md px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Revenue",
            value: `$${Number(dashboard?.stats.totalRevenue || 0).toFixed(2)}`,
            icon: DollarSign,
            color: "bg-green-100 text-green-700",
          },
          {
            label: "Total Orders",
            value: dashboard?.stats.totalOrders?.toString() || "0",
            icon: ShoppingCart,
            color: "bg-blue-100 text-blue-700",
          },
          {
            label: "Total Customers",
            value: dashboard?.stats.totalUsers?.toString() || "0",
            icon: TrendingUp,
            color: "bg-purple-100 text-purple-700",
          },
          {
            label: "Avg Order Value",
            value: salesReport?.summary?.avgOrderValue
              ? `$${Number(salesReport.summary.avgOrderValue).toFixed(2)}`
              : "$0.00",
            icon: BarChart3,
            color: "bg-amber-100 text-amber-700",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Period Summary */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-lg mb-4">Sales Report ({dateRange.startDate} to {dateRange.endDate})</h3>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Period Revenue</span>
              <span className="font-bold">${Number(salesReport?.summary?.totalRevenue || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Period Orders</span>
              <span className="font-bold">{salesReport?.summary?.totalOrders || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Average Order</span>
              <span className="font-bold">${Number(salesReport?.summary?.avgOrderValue || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-lg mb-4">Recent Orders in Period</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {salesReport?.orders?.slice(0, 10).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="font-medium text-sm">${Number(order.total).toFixed(2)}</span>
              </div>
            )) || <p className="text-gray-500 text-sm">No orders in this period</p>}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-bold text-lg mb-4">Top Selling Products</h3>
        <div className="space-y-3">
          {dashboard?.topProducts?.map((product, i) => (
            <div key={product.productId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold text-sm">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-sm">{product.productName}</p>
                <p className="text-xs text-gray-500">{product.totalSold} units sold</p>
              </div>
              <span className="font-bold">${Number(product.revenue).toFixed(2)}</span>
            </div>
          )) || <p className="text-gray-500">No data available</p>}
        </div>
      </div>
    </div>
  );
}
