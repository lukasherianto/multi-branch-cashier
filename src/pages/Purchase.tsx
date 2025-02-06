import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupplierManagement } from "@/components/pos/SupplierManagement";

const Purchase = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Transaksi Pembelian</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/purchase')}
          >
            <Plus className="h-4 w-4" />
            Tambah Pembelian
          </Button>
          <SupplierManagement onSuccess={() => {}} />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <p>Halaman Transaksi Pembelian sedang dalam pengembangan</p>
      </div>
    </div>
  );
};

export default Purchase;