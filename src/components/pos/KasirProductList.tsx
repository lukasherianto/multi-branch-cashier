
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
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
import { useAuth } from "@/hooks/auth";

interface KasirProductListProps {
  products: CartItem[];
  onAddToCart: (product: CartItem) => void;
  isRegisteredCustomer: boolean;
  memberType: "none" | "member1" | "member2";
}

export const KasirProductList = ({ 
  products, 
  onAddToCart, 
  isRegisteredCustomer,
  memberType
}: KasirProductListProps) => {
  const { handleAddToCart } = useProductList({
    products,
    onAddToCart,
    isRegisteredCustomer,
    memberType
  });
  
  const { cabangList } = useAuth();

  const getBranchName = (cabangId: number) => {
    const branch = cabangList.find(branch => branch.cabang_id === cabangId);
    return branch ? branch.branch_name : 'Unknown Branch';
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Cabang</TableHead>
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
              <TableCell>{getBranchName(product.cabang_id)}</TableCell>
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
                <Button
                  onClick={() => handleAddToCart(product)}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
