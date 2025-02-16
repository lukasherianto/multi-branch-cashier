
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StatCard from "./shared/StatCard";
import ProductInventoryTable from "./inventory/ProductInventoryTable";

const InventoryReport = () => {
  const { pelakuUsaha } = useAuth();

  const { data: inventory } = useQuery({
    queryKey: ["inventory-report", pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha) return null;

      const { data, error } = await supabase
        .from("produk")
        .select(`
          produk_id,
          product_name,
          stock,
          cost_price,
          retail_price,
          kategori_produk (
            kategori_name
          )
        `)
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id);

      if (error) throw error;
      return data;
    },
    enabled: !!pelakuUsaha
  });

  const lowStockThreshold = 10;
  const lowStockItems = inventory?.filter(item => item.stock <= lowStockThreshold) || [];
  const totalInventoryValue = inventory?.reduce(
    (sum, item) => sum + (Number(item.cost_price) * item.stock),
    0
  ) || 0;

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
          title="Total Produk"
          value={inventory?.length || 0}
        />
        <StatCard
          title="Nilai Inventaris"
          value={`Rp ${totalInventoryValue.toLocaleString("id-ID")}`}
        />
        <StatCard
          title="Stok Menipis"
          value={lowStockItems.length}
        />
      </div>

      <ProductInventoryTable
        products={lowStockItems}
        title="Produk Stok Menipis"
      />

      <ProductInventoryTable
        products={inventory || []}
        title="Semua Produk"
        showValue
      />
    </div>
  );
};

export default InventoryReport;
