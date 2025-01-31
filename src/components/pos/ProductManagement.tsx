import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductManagementProps {
  onSuccess?: () => void;
}

export const ProductManagement = ({ onSuccess }: ProductManagementProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [memberPrice, setMemberPrice] = useState("");
  const [stock, setStock] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Submitting product data...');
      const { data: pelakuUsahaData } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .single();

      if (!pelakuUsahaData) {
        toast({
          title: "Error",
          description: "Data pelaku usaha tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      const { data: kategoriData } = await supabase
        .from('kategori_produk')
        .select('kategori_id')
        .eq('pelaku_usaha_id', pelakuUsahaData.pelaku_usaha_id)
        .single();

      if (!kategoriData) {
        toast({
          title: "Error",
          description: "Kategori produk belum dibuat",
          variant: "destructive",
        });
        return;
      }

      console.log('Creating new product with data:', {
        pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
        kategori_id: kategoriData.kategori_id,
        product_name: productName,
        cost_price: parseFloat(costPrice),
        retail_price: parseFloat(retailPrice),
        member_price: memberPrice ? parseFloat(memberPrice) : null,
        stock: parseInt(stock),
      });

      const { error } = await supabase
        .from('produk')
        .insert({
          pelaku_usaha_id: pelakuUsahaData.pelaku_usaha_id,
          kategori_id: kategoriData.kategori_id,
          product_name: productName,
          cost_price: parseFloat(costPrice),
          retail_price: parseFloat(retailPrice),
          member_price: memberPrice ? parseFloat(memberPrice) : null,
          stock: parseInt(stock),
        });

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Produk berhasil ditambahkan",
      });

      setIsOpen(false);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan produk",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProductName("");
    setCostPrice("");
    setRetailPrice("");
    setMemberPrice("");
    setStock("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Produk Baru</DialogTitle>
          <DialogDescription>
            Isi informasi produk dengan lengkap
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Nama Produk</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              placeholder="Masukkan nama produk"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPrice">Harga Modal</Label>
            <Input
              id="costPrice"
              type="number"
              min="0"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              required
              placeholder="Masukkan harga modal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retailPrice">Harga Jual</Label>
            <Input
              id="retailPrice"
              type="number"
              min="0"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              required
              placeholder="Masukkan harga jual"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memberPrice">Harga Member</Label>
            <Input
              id="memberPrice"
              type="number"
              min="0"
              value={memberPrice}
              onChange={(e) => setMemberPrice(e.target.value)}
              placeholder="Masukkan harga member (opsional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stok</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              placeholder="Masukkan jumlah stok"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};