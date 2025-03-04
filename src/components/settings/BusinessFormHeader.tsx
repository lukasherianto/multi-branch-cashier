
import { Store } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const BusinessFormHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Store className="h-5 w-5" />
        Data Pelaku Usaha
      </CardTitle>
      <CardDescription>
        Kelola informasi usaha Anda
      </CardDescription>
    </CardHeader>
  );
};
