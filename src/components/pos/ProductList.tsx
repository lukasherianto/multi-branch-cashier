
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { StockManagement } from "./StockManagement";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CartItem } from "@/types/pos";
import { useProductList } from "@/features/pos/hooks/useProductList";

interface ProductListProps {
  products: CartItem[];
  onAddToCart: (product: CartItem) => void;
  isRegisteredCustomer: boolean;
  showStockAction?: boolean;
  onRefresh?: () => void;
}

export const ProductList = ({ 
  products, 
  onAddToCart, 
  isRegisteredCustomer,
  showStockAction,
  onRefresh 
}: ProductListProps) => {
  const { handleAddToCart } = useProductList({
    products,
    onAddToCart,
    isRegisteredCustomer
  });

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Harga Modal</TableHead>
            <TableHead>Harga Retail</TableHead>
            <TableHead>Harga Member 1</TableHead>
            <TableHead>Harga Member 2</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>Satuan</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.barcode || '-'}</TableCell>
              <TableCell>{product.category || '-'}</TableCell>
              <TableCell>Rp {product.cost_price.toLocaleString('id-ID')}</TableCell>
              <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
              <TableCell>
                {product.member_price_1 
                  ? `Rp ${product.member_price_1.toLocaleString('id-ID')}`
                  : '-'
                }
              </TableCell>
              <TableCell>
                {product.member_price_2 
                  ? `Rp ${product.member_price_2.toLocaleString('id-ID')}`
                  : '-'
                }
              </TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.unit}</TableCell>
              <TableCell>
                {showStockAction && onRefresh ? (
                  <StockManagement
                    productId={product.id}
                    currentStock={product.stock}
                    onSuccess={onRefresh}
                  />
                ) : (
                  <Button
                    onClick={() => handleAddToCart(product)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
