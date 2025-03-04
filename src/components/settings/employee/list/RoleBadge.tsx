
import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: string;
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const getBadgeColor = (role: string) => {
    switch (role) {
      case "pelaku_usaha":
        return "bg-red-500 hover:bg-red-600";
      case "admin":
        return "bg-blue-500 hover:bg-blue-600";
      case "kasir":
        return "bg-green-500 hover:bg-green-600";
      case "pelayan":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "pelaku_usaha":
        return "Pelaku Usaha";
      case "admin":
        return "Admin";
      case "kasir":
        return "Kasir";
      case "pelayan":
        return "Pelayan";
      default:
        return role;
    }
  };

  return (
    <Badge className={getBadgeColor(role)}>
      {getRoleDisplayName(role)}
    </Badge>
  );
};
