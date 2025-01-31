import { StockManagement } from "./StockManagement";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductListProps {
  products: Array<{
    id: number;
    name: string;
    price: number;
    member_price?: number | null;
    quantity: number;
    category?: string;
    stock: number;
  }>;
  onAddToCart: (product: any) => void;
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
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Harga</TableHead>
            {isRegisteredCustomer && <TableHead>Harga Member</TableHead>}
            <TableHead>Stok</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category || '-'}</TableCell>
              <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
              {isRegisteredCustomer && (
                <TableCell>
                  {product.member_price 
                    ? `Rp ${product.member_price.toLocaleString('id-ID')}`
                    : '-'
                  }
                </TableCell>
              )}
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                {showStockAction && onRefresh ? (
                  <StockManagement
                    productId={product.id}
                    currentStock={product.stock}
                    onSuccess={onRefresh}
                  />
                ) : (
                  <button
                    onClick={() => onAddToCart(product)}
                    className="bg-mint-500 text-white px-4 py-2 rounded hover:bg-mint-600 transition-colors"
                  >
                    Tambah
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};