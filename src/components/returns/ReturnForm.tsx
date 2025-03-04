
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";

interface ReturnFormProps {
  pelakuUsahaId?: number;
}

const ReturnForm = ({ pelakuUsahaId }: ReturnFormProps) => {
  const [transactionId, setTransactionId] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");

  const { data: transaction, refetch, isLoading: isLoadingTransaction } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      
      const { data, error } = await supabase
        .from("transaksi")
        .select(`
          transaksi_id,
          quantity,
          total_price,
          produk:produk_id (
            produk_id,
            product_name
          )
        `)
        .eq("transaksi_id", parseInt(transactionId))
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: false,
  });

  const handleSearch = () => {
    if (!transactionId.trim()) {
      toast.error("Masukkan ID Transaksi terlebih dahulu");
      return;
    }
    
    setSearching(true);
    refetch().then(() => {
      setSearching(false);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction || !selectedProduct) {
      toast.error("Silakan pilih produk yang akan diretur");
      return;
    }

    if (quantity > transaction.quantity) {
      toast.error("Jumlah retur tidak boleh melebihi jumlah pembelian");
      return;
    }

    try {
      const { error } = await supabase.from("retur").insert({
        transaksi_id: parseInt(transactionId),
        produk_id: selectedProduct,
        quantity,
        reason,
      });

      if (error) throw error;

      toast.success("Retur berhasil dicatat");

      // Reset form
      setTransactionId("");
      setSelectedProduct(null);
      setQuantity(1);
      setReason("");
    } catch (error) {
      console.error("Error creating return:", error);
      toast.error("Gagal mencatat retur");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="transactionId">ID Transaksi</Label>
        <div className="flex gap-2">
          <Input
            id="transactionId"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Masukkan ID transaksi"
          />
          <Button 
            type="button"
            onClick={handleSearch}
            disabled={searching || !transactionId.trim()}
          >
            {searching ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {transaction ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Pilih Produk</Label>
            <select
              id="product"
              className="w-full p-2 border rounded-md"
              value={selectedProduct || ""}
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
            >
              <option value="">Pilih produk</option>
              <option value={transaction.produk.produk_id}>
                {transaction.produk.product_name} (Qty: {transaction.quantity})
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Jumlah Retur</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={transaction.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Alasan Retur</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Masukkan alasan retur"
            />
          </div>

          <Button type="submit" className="w-full">
            Simpan Retur
          </Button>
        </form>
      ) : isLoadingTransaction ? (
        <div className="py-8 text-center">
          <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Mencari transaksi...</p>
        </div>
      ) : (
        transactionId.trim() && searching === false && (
          <div className="py-8 text-center">
            <p className="text-gray-500">Silakan cari transaksi terlebih dahulu</p>
          </div>
        )
      )}
    </div>
  );
};

export default ReturnForm;
