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
    member_price_1?: number | null;
    member_price_2?: number | null;
    quantity: number;
    category?: string;
    stock: number;
    barcode?: string;
    unit: string;
    cost_price: number;
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
    const priceToUse = isRegisteredCustomer && product.member_price_1 
      ? product.member_price_1 
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