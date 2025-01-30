import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Building, ShoppingBag } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Penjualan Hari Ini",
      value: "Rp 2.500.000",
      icon: DollarSign,
      trend: "+12,5%",
    },
    {
      title: "Total Transaksi",
      value: "48",
      icon: ShoppingBag,
      trend: "+8,2%",
    },
    {
      title: "Jumlah Cabang",
      value: "3",
      icon: Building,
      trend: "0%",
    },
    {
      title: "Pertumbuhan",
      value: "15,2%",
      icon: TrendingUp,
      trend: "+2,3%",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Dasbor</h2>
        <p className="text-gray-600 mt-2">Ringkasan aktivitas bisnis Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="bg-mint-50 p-3 rounded-lg">
                  <Icon className="w-6 h-6 text-mint-600" />
                </div>
                <span className="text-green-500 text-sm font-medium">
                  {stat.trend}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {stat.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Aktivitas Terkini
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div>
                <p className="font-medium text-gray-800">Transaksi #{1000 + index}</p>
                <p className="text-sm text-gray-600">Cabang Pusat</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800">Rp 150.000</p>
                <p className="text-sm text-gray-600">2 menit yang lalu</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;