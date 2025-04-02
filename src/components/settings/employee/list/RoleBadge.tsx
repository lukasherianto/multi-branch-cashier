
import { Badge } from "@/components/ui/badge";
import { getRoleDisplayName } from "../utils/roleMapper";

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
      case "gudang":
        return "bg-purple-500 hover:bg-purple-600";
      case "pelayan":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Badge className={getBadgeColor(role)}>
      {getRoleDisplayName(role)}
    </Badge>
  );
};
