
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building, Home, ShoppingCart, History, Settings, Package, FileText, Clock, DollarSign, Store, Users, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  icon: any;
  label: string;
  path: string;
  show?: boolean;
  subItems?: { label: string; path: string }[];
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Berhasil keluar",
        description: "Anda telah keluar dari akun",
      });
      navigate("/auth");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal keluar dari akun",
      });
    }
  };

  const isEmployee = user?.user_metadata?.is_employee || false;

  const mainNavItems: NavItem[] = [
    { icon: Home, label: "Dasbor", path: "/" },
    { icon: Building, label: "Cabang", path: "/branches", show: !isEmployee },
    { icon: Package, label: "Produk", path: "/products" },
    { icon: ShoppingCart, label: "Kasir", path: "/pos" },
    { icon: Clock, label: "Absensi", path: "/attendance" },
    { icon: History, label: "Riwayat", path: "/history" },
    { icon: FileText, label: "Laporan", path: "/reports", show: !isEmployee },
    { icon: DollarSign, label: "Kas", path: "/kas", show: !isEmployee },
    { icon: Settings, label: "Pengaturan", path: "/settings", show: !isEmployee },
    { 
      icon: Store, 
      label: "Supplier", 
      path: "/supplier",
      show: !isEmployee,
      subItems: [
        { label: "Daftar Supplier", path: "/supplier" },
        { label: "Transaksi Pembelian", path: "/purchase" }
      ]
    },
  ].filter(item => item.show !== false);

  const renderNavItem = (item: NavItem) => (
    <div key={item.path} className="space-y-1">
      <Link
        to={item.path}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          isActive(item.path) ? "bg-mint-50 text-mint-600" : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        <item.icon className="w-5 h-5" />
        <span>{item.label}</span>
      </Link>
      
      {item.subItems && (
        <div className="ml-7 space-y-1">
          {item.subItems.map(subItem => (
            <Link
              key={subItem.path}
              to={subItem.path}
              className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                isActive(subItem.path) ? "bg-mint-50 text-mint-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {subItem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  const mobileNavItems = mainNavItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <nav className="hidden md:flex flex-col w-48 bg-white border-r border-gray-200 p-3">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-mint-600">KasirBengkulu</h1>
            {user && (
              <p className="text-sm text-gray-600 mt-1">
                Login sebagai: {user.user_metadata?.full_name || user.email}
              </p>
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            {mainNavItems.map(renderNavItem)}
          </div>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-4"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Keluar
          </Button>
        </nav>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
          <div className="flex justify-around">
            {mobileNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-3 ${
                  isActive(item.path) ? "text-mint-600" : "text-gray-600"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center py-3 text-red-600"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-xs mt-1">Keluar</span>
            </button>
          </div>
        </div>

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
