import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Building, Home, ShoppingCart, History, Settings, Package, FileText, Clock, DollarSign } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { icon: Home, label: "Dasbor", path: "/" },
    { icon: Building, label: "Cabang", path: "/branches" },
    { icon: Package, label: "Produk", path: "/products" },
    { icon: ShoppingCart, label: "Kasir", path: "/pos" },
    { icon: Clock, label: "Absensi", path: "/attendance" },
    { icon: History, label: "Riwayat", path: "/history" },
    { icon: FileText, label: "Laporan", path: "/reports" },
    { icon: DollarSign, label: "Kas", path: "/kas" },
    { icon: Settings, label: "Pengaturan", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <nav className="hidden md:flex flex-col w-48 bg-white border-r border-gray-200 p-3">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-mint-600">KasirBengkulu</h1>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-mint-50 text-mint-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center py-3 ${
                    isActive(item.path)
                      ? "text-mint-600"
                      : "text-gray-600"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content - Updated with overflow-y-auto */}
        <main className="flex-1 overflow-y-auto p-8 pb-20 md:pb-8">
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;