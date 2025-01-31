import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      const newStock = currentStock + stockToAdd; // Changed from - to + to correctly add stock
      
      const { error } = await supabase
        .from('produk')
        .update({ stock: newStock })
        .eq('produk_id', productId);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Stok berhasil ditambahkan",
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
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Stok</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="additionalStock">Jumlah Stok</Label>
            <Input
              id="additionalStock"
              type="number"
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