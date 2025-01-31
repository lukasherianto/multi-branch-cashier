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
    barcode?: string;
    unit: string;
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
  const handleAddToCart = (product: any) => {
    // If customer is registered and member price exists, use member price
    const priceToUse = isRegisteredCustomer && product.member_price 
      ? product.member_price 
      : product.price;

    onAddToCart({
      ...product,
      price: priceToUse
    });
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Produk</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Harga Retail</TableHead>
            <TableHead>Harga Member</TableHead>
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
              <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
              <TableCell>
                {product.member_price 
                  ? `Rp ${product.member_price.toLocaleString('id-ID')}`
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
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-mint-500 text-white px-4 py-2 rounded hover:bg-mint-600 transition-colors"
                  >
                    Add
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