import { useRetur } from "@/hooks/useRetur";
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
  const {
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    reason,
    setReason,
    isOpen,
    setIsOpen,
    handleSubmit,
  } = useRetur({ transactionId, onSuccess });

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