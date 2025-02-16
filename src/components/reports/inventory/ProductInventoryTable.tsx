
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface Product {
  produk_id: number;
  product_name: string;
  stock: number;
  cost_price: number;
  kategori_produk: {
    kategori_name: string;
  };
}

interface ProductInventoryTableProps {
  products: Product[];
  title: string;
  showValue?: boolean;
}

const ProductInventoryTable = ({ products, title, showValue = false }: ProductInventoryTableProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produk</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Stok</TableHead>
            {showValue && <TableHead className="text-right">Nilai</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((item) => (
            <TableRow key={item.produk_id}>
              <TableCell>{item.product_name}</TableCell>
              <TableCell>{item.kategori_produk.kategori_name}</TableCell>
              <TableCell className="text-right">{item.stock}</TableCell>
              {showValue && (
                <TableCell className="text-right">
                  Rp {(Number(item.cost_price) * item.stock).toLocaleString("id-ID")}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ProductInventoryTable;
