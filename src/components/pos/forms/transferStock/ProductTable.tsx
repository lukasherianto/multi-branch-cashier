
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { type ProductTransfer } from "./schema";

interface ProductTableProps {
  paginatedProducts: ProductTransfer[];
  handleProductSelection: (produk_id: number, checked: boolean) => void;
  handleQuantityChange: (produk_id: number, quantity: number) => void;
}

export function ProductTable({ 
  paginatedProducts, 
  handleProductSelection, 
  handleQuantityChange 
}: ProductTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Pilih</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Stok Tersedia</TableHead>
            <TableHead className="w-48">Jumlah Transfer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProducts.map((product) => (
            <TableRow key={product.produk_id}>
              <TableCell>
                <Checkbox
                  checked={product.selected}
                  onCheckedChange={(checked) => 
                    handleProductSelection(product.produk_id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell>{product.product_name}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  max={product.stock}
                  value={product.quantity}
                  onChange={(e) => 
                    handleQuantityChange(product.produk_id, parseInt(e.target.value) || 0)
                  }
                  disabled={!product.selected}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
