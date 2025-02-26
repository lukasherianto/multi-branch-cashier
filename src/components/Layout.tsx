import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Store, Package2, History, FileBarChart2, Settings, ArrowLeftRight, Banknote, Building2, UserRound, MenuIcon, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import clsx from "clsx";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/pos", label: "POS", icon: Store },
  { 
    path: "/products",
    label: "Produk",
    icon: Package2,
    subItems: [
      { path: "/products", label: "Daftar Produk" },
      { path: "/products/categories", label: "Kategori" },
      { path: "/products/transfer", label: "Transfer Produk" }
    ]
  },
  { path: "/history", label: "Riwayat", icon: History },
  { path: "/returns", label: "Retur", icon: ArrowLeftRight },
  { path: "/reports", label: "Laporan", icon: FileBarChart2 },
  { 
    path: "/kas",
    label: "Kas",
    icon: Banknote,
    subItems: [
      { path: "/kas", label: "Kas Masuk/Keluar" },
      { path: "/kas/purchases", label: "Pembelian" }
    ]
  },
  { path: "/branches", label: "Cabang", icon: Building2 },
  { path: "/attendance", label: "Absensi", icon: UserRound },
  { path: "/settings", label: "Pengaturan", icon: Settings },
];

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const toggleSubmenu = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Berhasil keluar",
        description: "Anda telah keluar dari sistem",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Gagal keluar",
        description: "Terjadi kesalahan saat mencoba keluar",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const parentMenu = menuItems.find(item => 
      item.subItems?.some(sub => location.pathname === sub.path)
    );
    if (parentMenu && !expandedMenus.includes(parentMenu.path)) {
      setExpandedMenus(prev => [...prev, parentMenu.path]);
    }
  }, [location.pathname]);

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus.includes(item.path);

    if (hasSubItems) {
      return (
        <Collapsible open={isExpanded} onOpenChange={() => toggleSubmenu(item.path)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={clsx(
                "w-full justify-start gap-2 h-8 px-2 text-sm",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4 space-y-1">
            {item.subItems.map((subItem) => (
              <Button
                key={subItem.path}
                variant="ghost"
                className={clsx(
                  "w-full justify-start h-7 px-2 text-sm",
                  location.pathname === subItem.path && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleNavigate(subItem.path)}
              >
                {subItem.label}
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        variant="ghost"
        className={clsx(
          "w-full justify-start gap-2 h-8 px-2 text-sm",
          isActive && "bg-accent text-accent-foreground"
        )}
        onClick={() => handleNavigate(item.path)}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </Button>
    );
  };

  const MenuContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-grow space-y-0.5 py-2">
        {menuItems.map((item) => (
          <MenuItem key={item.path} item={item} />
        ))}
      </div>
      <div className="mt-auto p-2 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>
    </div>
  );

  const AppHeader = () => (
    <div className="flex flex-col">
      <Link to="/" className="font-semibold text-sm">
        Xaviera POS
      </Link>
      <span className="text-xs text-muted-foreground mt-1">
        Login Sebagai: {user?.email}
      </span>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-background border-b px-4 py-2 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MenuIcon className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-56 flex flex-col">
                <AppHeader />
                <div className="flex-1 mt-4">
                  <MenuContent />
                </div>
              </SheetContent>
            </Sheet>
            <AppHeader />
          </div>
        </header>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[200px_1fr]">
      <aside className="fixed top-0 z-50 h-screen w-48 border-r bg-background p-3 lg:static flex flex-col">
        <AppHeader />
        <div className="flex-1 mt-4">
          <MenuContent />
        </div>
      </aside>
      <main className="p-4 lg:p-6 ml-48 lg:ml-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
