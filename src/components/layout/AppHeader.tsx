
import { Link } from "react-router-dom";

interface AppHeaderProps {
  userEmail?: string | null;
}

export const AppHeader = ({ userEmail }: AppHeaderProps) => {
  return (
    <div className="flex flex-col">
      <Link to="/" className="font-semibold text-sm">
        Xaviera POS
      </Link>
      <span className="text-xs text-muted-foreground mt-1">
        Login Sebagai: {userEmail}
      </span>
    </div>
  );
};
