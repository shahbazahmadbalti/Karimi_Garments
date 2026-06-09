import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tag, Plus, Trash2 } from "lucide-react";

export default function CouponsManager() {
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minOrderAmount: "0",
    usageLimit: "",
    endDate: "",
  });

  const { data: coupons, isLoading } = trpc.coupon.list.useQuery();

  const createMutation = trpc.coupon.create.useMutation({
    onSuccess: () => {
      toast.success("Coupon created!");
      utils.coupon.list.invalidate();
      setShowForm(false);
      setFormData({ code: "", description: "", discountType: "percentage", discountValue: "", minOrderAmount: "0", usageLimit: "", endDate: "" });
    },
  });

  const deleteMutation = trpc.coupon.delete.useMutation({
    onSuccess: () => {
      toast.success("Coupon deleted!");
      utils.coupon.list.invalidate();
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Coupons</h2>
        <Button onClick={() => setShowForm(true)} className="bg-black hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-1" />
          Add Coupon
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-bold mb-4">New Coupon</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate({
                code: formData.code,
                description: formData.description,
                discountType: formData.discountType,
                discountValue: Number(formData.discountValue),
                minOrderAmount: Number(formData.minOrderAmount),
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
                endDate: formData.endDate || undefined,
              });
            }}
            className="grid md:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-sm font-medium mb-1 block">Code *</label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required placeholder="e.g. SUMMER20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Discount Value *</label>
              <Input type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Min Order Amount</label>
              <Input type="number" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Usage Limit</label>
              <Input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} placeholder="Unlimited" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Expiry Date</label>
              <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
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
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Code</th>
                  <th className="text-left px-4 py-3 font-medium">Discount</th>
                  <th className="text-left px-4 py-3 font-medium">Usage</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons?.map((coupon) => (
                  <tr key={coupon.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-medium bg-gray-100 px-2 py-1 rounded">{coupon.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `$${coupon.discountValue}`}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {coupon.usageCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (confirm("Delete this coupon?")) deleteMutation.mutate({ id: coupon.id });
                        }}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!coupons || coupons.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              No coupons yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
