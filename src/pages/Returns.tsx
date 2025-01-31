import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RotateCcw } from "lucide-react";

const Returns = () => {
  const [transactionId, setTransactionId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const { toast } = useToast();

  const { data: transaction, refetch } = useQuery({
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
        .eq("transaksi_id", parseInt(transactionId)) // Convert string to number
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!transactionId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction || !selectedProduct) {
      toast({
        title: "Error",
        description: "Silakan pilih produk yang akan diretur",
        variant: "destructive",
      });
      return;
    }

    if (quantity > transaction.quantity) {
      toast({
        title: "Error",
        description: "Jumlah retur tidak boleh melebihi jumlah pembelian",
        variant: "destructive",
      });
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

      toast({
        title: "Sukses",
        description: "Retur berhasil dicatat",
      });

      // Reset form
      setTransactionId("");
      setSelectedProduct(null);
      setQuantity(1);
      setReason("");
    } catch (error) {
      console.error("Error creating return:", error);
      toast({
        title: "Error",
        description: "Gagal mencatat retur",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Retur Produk</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
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
              variant="outline"
              onClick={() => refetch()}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {transaction && (
          <>
            <div className="space-y-2">
              <Label htmlFor="product">Pilih Produk</Label>
              <Select
                value={selectedProduct?.toString() || ""}
                onValueChange={(value) => setSelectedProduct(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    value={transaction.produk.produk_id.toString()}
                  >
                    {transaction.produk.product_name} (Qty: {transaction.quantity})
                  </SelectItem>
                </SelectContent>
              </Select>
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
          </>
        )}
      </form>
    </div>
  );
};

export default Returns;