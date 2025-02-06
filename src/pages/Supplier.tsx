import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SupplierManagement } from "@/components/pos/SupplierManagement";

const Supplier = () => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (pelakuUsahaData) {
        const { data: suppliersData, error } = await supabase
          .from('supplier')
          .select(`
            supplier_id,
            nama_usaha,
            alamat,
            kategori_produk (
              kategori_name
            )
          `)
          .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id);

        if (error) throw error;
        setSuppliers(suppliersData || []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengambil data supplier",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Supplier</h2>
        <SupplierManagement onSuccess={fetchSuppliers} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Usaha</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.supplier_id}>
                  <td className="px-4 py-2 text-sm">{supplier.nama_usaha}</td>
                  <td className="px-4 py-2 text-sm">{supplier.kategori_produk?.kategori_name}</td>
                  <td className="px-4 py-2 text-sm">{supplier.alamat || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Supplier;