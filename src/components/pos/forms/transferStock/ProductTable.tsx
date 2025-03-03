
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductWithSelection } from "@/types/pos";

export interface ProductTableProps {
  products: ProductWithSelection[];
  onSelectProduct: (productId: number, selected: boolean) => void;
  onQuantityChange: (productId: number, quantity: number) => void;
  loading: boolean;
}

export const ProductTable = ({ 
  products,
  onSelectProduct,
  onQuantityChange,
  loading
}: ProductTableProps) => {
  if (loading) {
    return (
      <div className="p-4 rounded-md bg-gray-50 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-4 rounded-md bg-gray-50 text-center">
        <p>No products found for this branch or matching your search.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Select</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="w-24">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Checkbox
                  checked={product.selected}
                  onCheckedChange={(checked) => {
                    onSelectProduct(product.id, !!checked);
                  }}
                />
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category || '-'}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.unit}</TableCell>
              <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={product.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 0 && value <= product.stock) {
                      onQuantityChange(product.id, value);
                    }
                  }}
                  className="w-20"
                  disabled={!product.selected}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
