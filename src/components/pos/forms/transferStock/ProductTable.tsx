
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ProductWithSelection } from "./hooks/useProducts";

interface ProductTableProps {
  paginatedProducts: ProductWithSelection[];
  handleProductSelection: (productId: number, selected: boolean) => void;
  handleQuantityChange: (productId: number, quantity: number) => void;
}

export const ProductTable = ({
  paginatedProducts,
  handleProductSelection,
  handleQuantityChange
}: ProductTableProps) => {
  if (paginatedProducts.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">
          Tidak ada produk yang tersedia untuk ditransfer
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Harga Modal</TableHead>
            <TableHead className="text-right">Harga Jual</TableHead>
            <TableHead className="text-right">Stok</TableHead>
            <TableHead className="text-right">Jumlah Transfer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Checkbox
                  checked={product.selected}
                  onCheckedChange={(checked) => 
                    handleProductSelection(product.id, checked === true)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.barcode || "-"}</TableCell>
              <TableCell>{product.category || "-"}</TableCell>
              <TableCell className="text-right">
                Rp {product.cost_price.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-right">
                Rp {product.price.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-right">{product.stock}</TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={product.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      handleQuantityChange(product.id, value);
                    }
                  }}
                  className="w-20 text-right"
                  disabled={!product.selected}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
