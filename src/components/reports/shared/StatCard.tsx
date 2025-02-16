
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard = ({ title, value }: StatCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold text-mint-600">{value}</p>
    </Card>
  );
};

export default StatCard;
