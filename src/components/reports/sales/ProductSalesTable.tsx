
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface ProductSalesTableProps {
  productSales: Record<string, number>;
  title: string;
  limit?: number;
}

const ProductSalesTable = ({ productSales, title, limit }: ProductSalesTableProps) => {
  const sortedProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produk</TableHead>
            <TableHead className="text-right">Jumlah Terjual</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.map(([product, quantity]) => (
            <TableRow key={product}>
              <TableCell>{product}</TableCell>
              <TableCell className="text-right">{quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ProductSalesTable;
