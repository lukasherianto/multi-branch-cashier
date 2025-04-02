
import { useAuth } from "@/hooks/auth";
import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Palette, Users, ShoppingCart, Store, ArrowRight, Receipt, RotateCcw, CalendarDays } from "lucide-react";

const CashierDashboard = () => {
  const { userRole } = useAuth();
  
  // Redirect non-cashiers to regular dashboard
  if (userRole !== 'kasir') {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="glass-card mb-8 p-8 rounded-xl">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Selamat Datang, Kasir
            </h1>
            <p className="text-muted-foreground text-lg">
              Akses cepat ke fitur-fitur utama kasir
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid - Cashier Version */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* POS Card */}
            <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-950">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <ShoppingCart className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Point of Sale</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Proses transaksi dengan cepat dan mudah
                    </p>
                    <a href="/pos" className="text-sm text-blue-500 hover:underline flex items-center gap-2">
                      Mulai Transaksi <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Card */}
            <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-950">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <Store className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Produk</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Lihat daftar produk tersedia
                    </p>
                    <a href="/products" className="text-sm text-purple-500 hover:underline flex items-center gap-2">
                      Lihat Produk <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History Card */}
            <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-950">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-orange-500/10">
                    <Receipt className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Riwayat</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Lihat riwayat transaksi
                    </p>
                    <a href="/history" className="text-sm text-orange-500 hover:underline flex items-center gap-2">
                      Lihat Riwayat <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Returns Card */}
            <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-950">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-red-500/10">
                    <RotateCcw className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Retur</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Kelola retur produk
                    </p>
                    <a href="/returns" className="text-sm text-red-500 hover:underline flex items-center gap-2">
                      Proses Retur <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Card */}
            <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-950">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <CalendarDays className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Absensi</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Catat kehadiran harian
                    </p>
                    <a href="/attendance" className="text-sm text-green-500 hover:underline flex items-center gap-2">
                      Absen <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members Card */}
            <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-950">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-indigo-500/10">
                    <Users className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Member</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Lihat data member
                    </p>
                    <a href="/members" className="text-sm text-indigo-500 hover:underline flex items-center gap-2">
                      Data Member <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Card */}
            <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gray-500/10">
                    <Palette className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Profil</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Kelola profil Anda
                    </p>
                    <a href="/settings" className="text-sm text-gray-500 hover:underline flex items-center gap-2">
                      Lihat Profil <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CashierDashboard;
