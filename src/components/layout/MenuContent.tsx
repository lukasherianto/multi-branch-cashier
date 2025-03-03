
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { MenuItem } from "./MenuItem";
import menuConfig from "./menuConfig";

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
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow space-y-0.5 py-2">
        {menuConfig.map((section) => (
          <div key={section.title} className="mb-3">
            <h3 className="px-2 text-xs uppercase font-medium text-muted-foreground mb-1">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
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
        ))}
      </div>
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
