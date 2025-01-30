import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Building, ShoppingBag, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { toast } = useToast();

  // Fetch data dari Supabase
  const { data: branchCount } = useQuery({
    queryKey: ['branchCount'],
    queryFn: async () => {
      try {
        // First get pelaku_usaha_id
        const { data: pelakuUsaha, error: pelakuUsahaError } = await supabase
          .from('pelaku_usaha')
          .select('pelaku_usaha_id')
          .maybeSingle();

        if (pelakuUsahaError) {
          console.error('Error fetching pelaku_usaha:', pelakuUsahaError);
          throw pelakuUsahaError;
        }

        if (!pelakuUsaha) {
          console.log('No pelaku_usaha found');
          return 0;
        }

        // Then get branch count for this pelaku_usaha
        const { count, error: branchError } = await supabase
          .from('cabang')
          .select('*', { count: 'exact', head: true })
          .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);

        if (branchError) {
          console.error('Error fetching branch count:', branchError);
          throw branchError;
        }

        return count || 0;
      } catch (error) {
        console.error('Error in branchCount query:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data cabang",
          variant: "destructive",
        });
        return 0;
      }
    }
  });

  const stats = [
    {
      title: "Total Penjualan Hari Ini",
      value: "Rp 2.500.000",
      icon: DollarSign,
      trend: "+12,5%",
      trendIcon: ArrowUpRight,
      trendColor: "text-green-500",
    },
    {
      title: "Total Transaksi",
      value: "48",
      icon: ShoppingBag,
      trend: "-3,2%",
      trendIcon: ArrowDownRight,
      trendColor: "text-red-500",
    },
    {
      title: "Jumlah Cabang",
      value: branchCount?.toString() || "0",
      icon: Building,
      trend: "0%",
      trendIcon: ArrowUpRight,
      trendColor: "text-gray-500",
    },
    {
      title: "Pertumbuhan",
      value: "15,2%",
      icon: TrendingUp,
      trend: "+2,3%",
      trendIcon: ArrowUpRight,
      trendColor: "text-green-500",
    },
  ];

  const recentTransactions = [
    {
      id: "TR001",
      amount: "Rp 150.000",
      branch: "Cabang Pusat",
      time: "2 menit yang lalu",
      status: "success"
    },
    {
      id: "TR002",
      amount: "Rp 75.000",
      branch: "Cabang Timur",
      time: "15 menit yang lalu",
      status: "success"
    },
    {
      id: "TR003",
      amount: "Rp 225.000",
      branch: "Cabang Barat",
      time: "45 menit yang lalu",
      status: "success"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Dasbor</h2>
        <p className="text-gray-600 mt-2">Selamat datang kembali! Berikut ringkasan bisnis Anda hari ini</p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendIcon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="bg-mint-50 p-3 rounded-lg">
                  <Icon className="w-6 h-6 text-mint-600" />
                </div>
                <div className={`flex items-center ${stat.trendColor}`}>
                  <TrendIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    {stat.trend}
                  </span>
                </div>
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

      {/* Transaksi Terkini */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Transaksi Terkini
          </h3>
          <button className="text-mint-600 hover:text-mint-700 text-sm font-medium">
            Lihat Semua
          </button>
        </div>
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div>
                <p className="font-medium text-gray-800">Transaksi #{transaction.id}</p>
                <p className="text-sm text-gray-600">{transaction.branch}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-800">{transaction.amount}</p>
                <p className="text-sm text-gray-600">{transaction.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Grafik Penjualan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Penjualan per Cabang
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Grafik penjualan per cabang akan ditampilkan di sini
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Produk Terlaris
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Grafik produk terlaris akan ditampilkan di sini
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;