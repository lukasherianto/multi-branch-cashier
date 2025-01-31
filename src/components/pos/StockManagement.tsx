import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StockManagementProps {
  productId: number;
  currentStock: number;
  onSuccess: () => void;
}

export const StockManagement = ({ productId, currentStock, onSuccess }: StockManagementProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [additionalStock, setAdditionalStock] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert additionalStock to number and add it to currentStock
      const stockToAdd = parseInt(additionalStock);
      if (isNaN(stockToAdd) || stockToAdd < 0) {
        toast({
          title: "Error",
          description: "Jumlah stok harus berupa angka positif",
          variant: "destructive",
        });
        return;
      }

      console.log('Current stock:', currentStock);
      console.log('Stock to add:', stockToAdd);
      const newStock = currentStock + stockToAdd;
      console.log('New stock calculated:', newStock);
      
      const { error } = await supabase
        .from('produk')
        .update({ stock: newStock })
        .eq('produk_id', productId);

      if (error) {
        console.error('Error updating stock:', error);
        throw error;
      }

      toast({
        title: "Sukses",
        description: `Stok berhasil ditambahkan. Stok baru: ${newStock}`,
      });

      setIsOpen(false);
      setAdditionalStock("");
      onSuccess();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan stok",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Stok</DialogTitle>
          <DialogDescription>
            Stok saat ini: {currentStock}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="additionalStock">Jumlah Stok yang Ditambahkan</Label>
            <Input
              id="additionalStock"
              type="number"
              min="1"
              value={additionalStock}
              onChange={(e) => setAdditionalStock(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Simpan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};