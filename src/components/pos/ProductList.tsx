import { StockManagement } from "./StockManagement";

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
    <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              {product.category && (
                <p className="text-sm text-gray-500">{product.category}</p>
              )}
            </div>
            {showStockAction && onRefresh && (
              <StockManagement
                productId={product.id}
                currentStock={product.stock}
                onSuccess={onRefresh}
              />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-gray-900">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
            {isRegisteredCustomer && product.member_price && (
              <p className="text-sm text-mint-600">
                Member: Rp {product.member_price.toLocaleString('id-ID')}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Stok: {product.stock}
            </p>
          </div>
          {!showStockAction && (
            <button
              onClick={() => onAddToCart(product)}
              className="mt-3 w-full bg-mint-500 text-white px-4 py-2 rounded hover:bg-mint-600 transition-colors"
            >
              Tambah ke Keranjang
            </button>
          )}
        </div>
      ))}
    </div>
  );
};