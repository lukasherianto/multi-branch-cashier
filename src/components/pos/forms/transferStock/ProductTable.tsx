
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductWithSelection } from "@/types/pos";

interface ProductTableProps {
  products: ProductWithSelection[];
  loading: boolean;
  onSelectProduct: (productId: number, selected: boolean) => void;
  onQuantityChange: (productId: number, quantity: number) => void;
}

export const ProductTable = ({ products, loading, onSelectProduct, onQuantityChange }: ProductTableProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Pilih</TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>Harga Modal</TableHead>
            <TableHead>Harga Jual</TableHead>
            <TableHead className="w-24">Jumlah</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                Tidak ada produk tersedia
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={product.selected}
                    onCheckedChange={(checked) => 
                      onSelectProduct(product.id, !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.stock} {product.unit}</TableCell>
                <TableCell>Rp {product.cost_price.toLocaleString('id-ID')}</TableCell>
                <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={product.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value > 0 && value <= product.stock) {
                        onQuantityChange(product.id, value);
                      }
                    }}
                    disabled={!product.selected}
                    className="w-20"
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
