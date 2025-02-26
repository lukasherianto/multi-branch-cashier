
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { MenuItem } from "./MenuItem";
import { menuItems } from "./menuConfig";

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
        {menuItems.map((item) => (
          <MenuItem
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
            isExpanded={expandedMenus.includes(item.path)}
            onToggle={() => onToggleSubmenu(item.path)}
            onNavigate={onNavigate}
          />
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
