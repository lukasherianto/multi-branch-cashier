import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const BusinessFormSkeleton = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </CardContent>
    </Card>
  );
};