
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Store, Package2, History, FileBarChart2, Settings, ArrowLeftRight, Banknote, Building2, UserRound, MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import clsx from "clsx";
import { useIsMobile } from "@/hooks/use-mobile";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/pos", label: "POS", icon: Store },
  { 
    path: "/products",
    label: "Produk",
    icon: Package2,
    subItems: [
      { path: "/products", label: "Daftar Produk" },
      { path: "/products/categories", label: "Kategori" }
    ]
  },
  { path: "/history", label: "Riwayat", icon: History },
  { path: "/returns", label: "Retur", icon: ArrowLeftRight },
  { path: "/reports", label: "Laporan", icon: FileBarChart2 },
  { path: "/kas", label: "Kas", icon: Banknote },
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

  useEffect(() => {
    // Find parent menu of current route and expand it
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
                "w-full justify-start gap-2",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-6 space-y-1">
            {item.subItems.map((subItem) => (
              <Button
                key={subItem.path}
                variant="ghost"
                className={clsx(
                  "w-full justify-start",
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
          "w-full justify-start gap-2",
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
    <div className="space-y-1 py-2">
      {menuItems.map((item) => (
        <MenuItem key={item.path} item={item} />
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen">
        <header className="bg-background border-b px-4 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <MenuContent />
              </SheetContent>
            </Sheet>
            <Link to="/" className="font-semibold">
              Lovable POS
            </Link>
          </div>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="fixed top-0 z-50 h-screen w-60 border-r bg-background p-4 lg:static">
        <Link to="/" className="mb-4 block font-semibold">
          Lovable POS
        </Link>
        <MenuContent />
      </aside>
      <main className="p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
