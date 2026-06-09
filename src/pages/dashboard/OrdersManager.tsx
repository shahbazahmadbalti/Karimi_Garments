import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShoppingCart, Eye } from "lucide-react";

export default function OrdersManager() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: ordersData } = trpc.order.listAll.useQuery({
    status: statusFilter || undefined,
  });
  const utils = trpc.useUtils();

  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated!");
      utils.order.listAll.invalidate();
      setSelectedOrder(null);
    },
  });

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
    return colors[status] || "bg-gray-100";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedOrder ? (
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Order #{selectedOrder.orderNumber}</h3>
            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
              Back to List
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <Badge className={getStatusColor(selectedOrder.status)}>
                {selectedOrder.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Status</p>
              <Badge className={getStatusColor(selectedOrder.paymentStatus)}>
                {selectedOrder.paymentStatus}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Method</p>
              <p className="font-medium capitalize">{selectedOrder.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="mb-6">
            <h4 className="font-medium mb-3">Items</h4>
            <div className="space-y-2">
              {selectedOrder.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img src={item.productImage || "/placeholder.svg"} alt="" className="w-10 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} x ${Number(item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${Number(selectedOrder.total).toFixed(2)}</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Update Status</h4>
            <div className="flex gap-2 flex-wrap">
              {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={selectedOrder.status === status ? "default" : "outline"}
                  onClick={() => updateStatus.mutate({ id: selectedOrder.id, status: status as any })}
                  disabled={updateStatus.isPending}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Order #</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Total</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Payment</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersData?.items.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium">${Number(order.total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">{order.paymentMethod}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!ordersData?.items || ordersData.items.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              No orders found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
