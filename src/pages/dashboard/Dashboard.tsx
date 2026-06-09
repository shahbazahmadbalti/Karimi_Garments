import { Routes, Route, Navigate, useNavigate, Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Image,
  Tag,
  BarChart3,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

import DashboardOverview from "./DashboardOverview";
import ProductsManager from "./ProductsManager";
import OrdersManager from "./OrdersManager";
import UsersManager from "./UsersManager";
import BannersManager from "./BannersManager";
import CouponsManager from "./CouponsManager";
import Analytics from "./Analytics";
import SettingsManager from "./SettingsManager";

export default function Dashboard() {
  const { user, isAuthenticated, isStaff, isLoading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isStaff)) {
      toast.error("Access denied. Staff or Admin required.");
      navigate("/");
    }
  }, [isLoading, isAuthenticated, isStaff, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isStaff) return null;

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Package, label: "Products", path: "/dashboard/products" },
    { icon: ShoppingCart, label: "Orders", path: "/dashboard/orders" },
    { icon: Users, label: "Users", path: "/dashboard/users" },
    { icon: Image, label: "Banners", path: "/dashboard/banners" },
    { icon: Tag, label: "Coupons", path: "/dashboard/coupons" },
    { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    ...(user?.role === "admin"
      ? [{ icon: Settings, label: "Settings", path: "/dashboard/settings" }]
      : []),
  ];

  return (
    <div className="flex h-screen bg-gray-100 -mt-[120px] pt-[120px]">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-black text-white transition-all duration-300 ${
          sidebarOpen ? "w-64 translate-x-0" : "w-0 lg:w-16 -translate-x-full lg:translate-x-0 overflow-hidden"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 flex items-center justify-center">
                <span className="text-black font-bold">K</span>
              </div>
              <span className="font-bold tracking-wider">ADMIN</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-2 space-y-1 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Store
            </Button>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Karimi Garments Admin</h1>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/products" element={<ProductsManager />} />
            <Route path="/orders" element={<OrdersManager />} />
            <Route path="/users" element={<UsersManager />} />
            <Route path="/banners" element={<BannersManager />} />
            <Route path="/coupons" element={<CouponsManager />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<SettingsManager />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
