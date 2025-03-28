
import { CardHeader, CardTitle } from "@/components/ui/card";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="text-center text-2xl font-bold">
        {title}
      </CardTitle>
      <p className="text-center text-sm text-gray-600">
        {subtitle}
      </p>
    </CardHeader>
  );
};
