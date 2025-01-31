import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw } from "lucide-react";

interface ReturFormProps {
  transactionId: number;
  products: Array<{
    id: number;
    name: string;
    quantity: number;
  }>;
  onSuccess?: () => void;
}

export const ReturForm = ({ transactionId, products, onSuccess }: ReturFormProps) => {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Silakan pilih produk yang akan diretur",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (quantity > product.quantity) {
      toast({
        title: "Error",
        description: "Jumlah retur tidak boleh melebihi jumlah pembelian",
        variant: "destructive",
      });
      return;
    }

    try {
      // Start a Supabase transaction
      const { data: transaction, error: fetchError } = await supabase
        .from("transaksi")
        .select("quantity, total_price")
        .eq("transaksi_id", transactionId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new values
      const newQuantity = transaction.quantity - quantity;
      const pricePerUnit = transaction.total_price / transaction.quantity;
      const newTotalPrice = newQuantity * pricePerUnit;

      // Insert retur record
      const { error: returError } = await supabase.from("retur").insert({
        transaksi_id: transactionId,
        produk_id: selectedProduct,
        quantity,
        reason,
      });

      if (returError) throw returError;

      // Update transaction record
      const { error: updateError } = await supabase
        .from("transaksi")
        .update({
          quantity: newQuantity,
          total_price: newTotalPrice,
        })
        .eq("transaksi_id", transactionId);

      if (updateError) throw updateError;

      toast({
        title: "Sukses",
        description: "Retur berhasil dicatat",
      });

      setIsOpen(false);
      if (onSuccess) onSuccess();
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Retur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retur Produk</DialogTitle>
        </DialogHeader>
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
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Qty: {product.quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Jumlah Retur</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
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
      </DialogContent>
    </Dialog>
  );
};