
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface CategorySalesTableProps {
  categorySales: Record<string, number>;
}

const CategorySalesTable = ({ categorySales }: CategorySalesTableProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Penjualan per Kategori</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Total Penjualan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(categorySales)
            .sort(([, a], [, b]) => b - a)
            .map(([category, total]) => (
              <TableRow key={category}>
                <TableCell>{category}</TableCell>
                <TableCell className="text-right">
                  Rp {total.toLocaleString("id-ID")}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CategorySalesTable;
