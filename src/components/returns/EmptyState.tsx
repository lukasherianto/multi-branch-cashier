
import { Card, CardContent } from "@/components/ui/card";

const EmptyState = () => {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Silakan lengkapi profil usaha Anda terlebih dahulu
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyState;
