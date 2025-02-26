
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { Palette, Users, LineChart, ShoppingCart, Store, ArrowRight, FileText, Receipt, RotateCcw } from "lucide-react";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Hero Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="glass-card mb-8 p-8 rounded-xl">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Selamat Datang di Xaviera POS
            </h1>
            <p className="text-muted-foreground text-lg">
              Sistem Point of Sale modern untuk mengelola bisnis Anda dengan lebih efisien
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
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
                      Kelola produk dan stok dengan mudah
                    </p>
                    <a href="/products" className="text-sm text-purple-500 hover:underline flex items-center gap-2">
                      Kelola Produk <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports Card */}
            <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-950">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <LineChart className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Laporan</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Analisis performa bisnis Anda
                    </p>
                    <a href="/reports" className="text-sm text-green-500 hover:underline flex items-center gap-2">
                      Lihat Laporan <ArrowRight className="h-4 w-4" />
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

            {/* Settings Card */}
            <Card className="hover-lift transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gray-500/10">
                    <Users className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Pengaturan</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Kelola pengaturan sistem
                    </p>
                    <a href="/settings" className="text-sm text-gray-500 hover:underline flex items-center gap-2">
                      Buka Pengaturan <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Aksi Cepat</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a href="/pos" className="p-4 rounded-lg bg-background hover:bg-accent transition-colors flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>POS</span>
                </a>
                <a href="/products" className="p-4 rounded-lg bg-background hover:bg-accent transition-colors flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  <span>Produk</span>
                </a>
                <a href="/reports" className="p-4 rounded-lg bg-background hover:bg-accent transition-colors flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Laporan</span>
                </a>
                <a href="/settings" className="p-4 rounded-lg bg-background hover:bg-accent transition-colors flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <span>Pengaturan</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
