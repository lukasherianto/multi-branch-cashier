
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface MenuItemProps {
  item: {
    path: string;
    label: string;
    icon: LucideIcon;
    subItems?: Array<{
      path: string;
      label: string;
    }>;
  };
  isActive: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onNavigate: (path: string) => void;
}

export const MenuItem = ({ item, isActive, isExpanded, onToggle, onNavigate }: MenuItemProps) => {
  const Icon = item.icon;
  const hasSubItems = item.subItems && item.subItems.length > 0;

  if (hasSubItems) {
    return (
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
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
              onClick={() => onNavigate(subItem.path)}
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
      onClick={() => onNavigate(item.path)}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Button>
  );
};
