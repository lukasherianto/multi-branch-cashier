
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Scale, ListChecks, ArrowLeftRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/auth';

interface KasirMenuItem {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
}

const Kasir = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [menuItems, setMenuItems] = useState<KasirMenuItem[]>([]);

  useEffect(() => {
    // Define items that should be displayed on the kasir page
    const items: KasirMenuItem[] = [
      {
        title: 'Ringkasan',
        description: 'Lihat ringkasan data penjualan dan aktivitas',
        icon: LayoutDashboard,
        path: '/'
      },
      {
        title: 'POS',
        description: 'Lakukan transaksi penjualan',
        icon: Scale,
        path: '/pos'
      },
      {
        title: 'Riwayat Transaksi',
        description: 'Lihat riwayat transaksi yang telah dilakukan',
        icon: ListChecks,
        path: '/history'
      },
      {
        title: 'Retur',
        description: 'Kelola pengembalian produk',
        icon: ArrowLeftRight,
        path: '/returns'
      },
      {
        title: 'Absensi',
        description: 'Rekam kehadiran',
        icon: CalendarDays,
        path: '/attendance'
      }
    ];

    setMenuItems(items);
  }, [userRole]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Menu Kasir</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card 
            key={item.title} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Kasir;
