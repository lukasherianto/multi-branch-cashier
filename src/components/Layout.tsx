
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "./layout/AppHeader";
import { MenuContent } from "./layout/MenuContent";
import menuConfig from "./layout/menuConfig";

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
    // Add a debugging console log to help identify any issues
    console.log('Layout component mounted', { location, expandedMenus, menuConfig });
    
    try {
      for (const section of menuConfig) {
        const foundItem = section.items.find(item => location.pathname === item.path);
        if (foundItem && !expandedMenus.includes(foundItem.path)) {
          setExpandedMenus(prev => [...prev, foundItem.path]);
          break;
        }
      }
    } catch (err) {
      console.error('Error in Layout useEffect:', err);
    }
  }, [location.pathname]);

  // Add a debugging console log for the render path
  console.log('Layout rendering', { isMobile, user });

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
              <SheetContent side="left" className="w-56 flex flex-col p-0">
                <div className="p-3">
                  <AppHeader userEmail={user?.email} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <MenuContent 
                    expandedMenus={expandedMenus}
                    location={location}
                    onNavigate={handleNavigate}
                    onToggleSubmenu={toggleSubmenu}
                    onLogout={handleLogout}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <AppHeader userEmail={user?.email} />
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
        <AppHeader userEmail={user?.email} />
        <div className="flex-1 overflow-hidden mt-4">
          <MenuContent 
            expandedMenus={expandedMenus}
            location={location}
            onNavigate={handleNavigate}
            onToggleSubmenu={toggleSubmenu}
            onLogout={handleLogout}
          />
        </div>
      </aside>
      <main className="p-4 lg:p-6 ml-48 lg:ml-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
