
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { MenuItem } from "./MenuItem";
import menuConfig from "./menuConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMenuAccess } from "@/hooks/useMenuAccess";
import { useAuth } from "@/hooks/useAuth";

interface MenuContentProps {
  expandedMenus: string[];
  location: { pathname: string };
  onNavigate: (path: string) => void;
  onToggleSubmenu: (path: string) => void;
  onLogout: () => void;
}

export const MenuContent = ({ 
  expandedMenus, 
  location, 
  onNavigate, 
  onToggleSubmenu,
  onLogout 
}: MenuContentProps) => {
  const { hasAccess } = useMenuAccess();
  const { userRole } = useAuth();
  
  // Check if the user is a business owner (pelaku_usaha)
  const isPelakuUsaha = userRole === 'pelaku_usaha';

  // For debugging
  console.log('MenuContent rendering:', { userRole, isPelakuUsaha, menuConfig });

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow">
        <div className="space-y-0.5 py-2 pr-2">
          {menuConfig.map((section) => {
            // For business owners, show all items without filtering
            // For other roles, filter items based on access permissions
            const items = isPelakuUsaha
              ? section.items
              : section.items.filter(item => hasAccess(item.path));
            
            // Skip sections with no accessible items
            if (items.length === 0) return null;
            
            return (
              <div key={section.title} className="mb-3">
                <h3 className="px-2 text-xs uppercase font-medium text-muted-foreground mb-1">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <MenuItem
                      key={item.path}
                      item={{
                        path: item.path,
                        label: item.title,
                        icon: item.icon
                      }}
                      isActive={location.pathname === item.path}
                      isExpanded={expandedMenus.includes(item.path)}
                      onToggle={() => onToggleSubmenu(item.path)}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="mt-auto p-2 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>
    </div>
  );
};
