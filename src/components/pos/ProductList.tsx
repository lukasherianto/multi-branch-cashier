import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface Product {
  id: number;
  name: string;
  price: number;
  member_price?: number | null;
  quantity: number;
  category?: string;
  stock?: number;
}

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  isRegisteredCustomer?: boolean;
}

export const ProductList = ({ products, onAddToCart, isRegisteredCustomer }: ProductListProps) => {
  return (
    <Card className="flex-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Nama Produk</TableHead>
            <TableHead className="text-xs">Kategori</TableHead>
            <TableHead className="text-xs text-right">Harga Retail</TableHead>
            <TableHead className="text-xs text-right">Harga Member</TableHead>
            <TableHead className="text-xs text-right">Stok</TableHead>
            <TableHead className="text-xs text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const displayPrice = isRegisteredCustomer && product.member_price 
              ? product.member_price 
              : product.price;

            return (
              <TableRow key={product.id} className="text-sm">
                <TableCell className="py-2 text-xs">{product.name}</TableCell>
                <TableCell className="py-2 text-xs">{product.category}</TableCell>
                <TableCell className="py-2 text-xs text-right">
                  Rp {product.price.toLocaleString('id-ID')}
                </TableCell>
                <TableCell className="py-2 text-xs text-right">
                  {product.member_price ? (
                    <>
                      Rp {product.member_price.toLocaleString('id-ID')}
                      {isRegisteredCustomer && (
                        <span className="text-green-600 ml-1 text-[10px]">(Aktif)</span>
                      )}
                    </>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="py-2 text-xs text-right">{product.stock}</TableCell>
                <TableCell className="py-2 text-xs text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Input
                      type="number"
                      className="w-16 h-7 text-xs"
                      min="1"
                      defaultValue="1"
                      onChange={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.value = Math.max(1, parseInt(input.value) || 1).toString();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          const quantity = parseInt(input.value) || 1;
                          onAddToCart({
                            ...product,
                            price: displayPrice
                          }, quantity);
                          input.value = "1";
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs px-2 py-1 h-7"
                      onClick={(e) => {
                        const input = e.currentTarget.previousSibling as HTMLInputElement;
                        const quantity = parseInt(input.value) || 1;
                        onAddToCart({
                          ...product,
                          price: displayPrice
                        }, quantity);
                        input.value = "1";
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};