import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  User,
  Store,
  CreditCard,
  Truck,
  Bell,
  Mail,
  Globe,
  Palette,
} from "lucide-react";

export default function SettingsManager() {
  const { user } = useAuth();

  const settingsGroups = [
    {
      title: "Store Information",
      icon: Store,
      items: [
        { label: "Store Name", value: "Karimi Garments", icon: Store },
        { label: "Business Email", value: "info@karimigarments.com", icon: Mail },
        { label: "Phone", value: "+93 123 456 789", icon: User },
        { label: "Address", value: "123 Garment District, Kabul, Afghanistan", icon: Globe },
        { label: "Currency", value: "USD ($)", icon: CreditCard },
      ],
    },
    {
      title: "Shipping Settings",
      icon: Truck,
      items: [
        { label: "Free Shipping Threshold", value: "$100.00", icon: Truck },
        { label: "Standard Shipping", value: "$10.00", icon: Truck },
        { label: "Express Shipping", value: "$25.00", icon: Truck },
        { label: "Shipping Countries", value: "Worldwide", icon: Globe },
      ],
    },
    {
      title: "Payment Settings",
      icon: CreditCard,
      items: [
        { label: "Stripe", value: "Connected", icon: CreditCard, status: "active" },
        { label: "PayPal", value: "Pending Setup", icon: CreditCard, status: "pending" },
        { label: "Cash on Delivery", value: "Enabled", icon: CreditCard, status: "active" },
        { label: "Tax Rate", value: "0%", icon: CreditCard },
      ],
    },
    {
      title: "Appearance",
      icon: Palette,
      items: [
        { label: "Primary Color", value: "Black & Gold", icon: Palette },
        { label: "Theme", value: "Light Mode", icon: Palette },
        { label: "Product Grid", value: "4 Columns", icon: Store },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        { label: "Order Notifications", value: "Enabled", icon: Bell, status: "active" },
        { label: "Low Stock Alerts", value: "Enabled", icon: Bell, status: "active" },
        { label: "Customer Reviews", value: "Enabled", icon: Bell, status: "active" },
        { label: "Newsletter", value: "Enabled", icon: Bell, status: "active" },
      ],
    },
    {
      title: "Security",
      icon: Shield,
      items: [
        { label: "Authentication", value: "OAuth 2.0 + Kimi", icon: Shield, status: "active" },
        { label: "Session Timeout", value: "24 hours", icon: Shield },
        { label: "Admin Access", value: "Role-based", icon: Shield },
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <Badge variant="outline" className="text-sm">Admin Only</Badge>
      </div>

      {/* Admin Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Current Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{user?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <Badge className="capitalize">{user?.role}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Access Level</p>
              <Badge className="bg-green-100 text-green-700">Full Access</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Groups */}
      <div className="grid lg:grid-cols-2 gap-6">
        {settingsGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <group.icon className="w-5 h-5 text-amber-600" />
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.items.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.value}</span>
                        {(item as any).status === "active" && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                        )}
                        {(item as any).status === "pending" && (
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">Pending</Badge>
                        )}
                      </div>
                    </div>
                    {i < group.items.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
