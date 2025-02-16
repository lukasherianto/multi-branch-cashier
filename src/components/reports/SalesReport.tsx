
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StatCard from "./shared/StatCard";
import ProductSalesTable from "./sales/ProductSalesTable";
import CategorySalesTable from "./sales/CategorySalesTable";

const SalesReport = () => {
  const { pelakuUsaha } = useAuth();

  const { data: salesData } = useQuery({
    queryKey: ["sales-report", pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha) return null;

      const { data, error } = await supabase
        .from("transaksi")
        .select(`
          transaksi_id,
          quantity,
          total_price,
          produk:produk_id (
            product_name,
            kategori_produk (
              kategori_name
            )
          ),
          cabang:cabang_id (
            branch_name
          )
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!pelakuUsaha
  });

  const totalTransactions = salesData?.length || 0;
  const totalRevenue = salesData?.reduce((sum, sale) => sum + Number(sale.total_price), 0) || 0;

  const productSales = salesData?.reduce((acc, sale) => {
    if (sale.produk && sale.produk.product_name) {
      const productName = sale.produk.product_name;
      acc[productName] = (acc[productName] || 0) + sale.quantity;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const categorySales = salesData?.reduce((acc, sale) => {
    if (sale.produk?.kategori_produk?.kategori_name) {
      const category = sale.produk.kategori_produk.kategori_name;
      acc[category] = (acc[category] || 0) + Number(sale.total_price);
    }
    return acc;
  }, {} as Record<string, number>) || {};

  if (!pelakuUsaha) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Silakan lengkapi profil usaha Anda terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Transaksi"
          value={totalTransactions}
        />
        <StatCard
          title="Total Pendapatan"
          value={`Rp ${totalRevenue.toLocaleString("id-ID")}`}
        />
      </div>

      <ProductSalesTable
        productSales={productSales}
        title="Produk Terlaris"
        limit={5}
      />

      <CategorySalesTable categorySales={categorySales} />
    </div>
  );
};

export default SalesReport;
