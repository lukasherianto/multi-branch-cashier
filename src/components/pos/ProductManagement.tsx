
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CategoryForm } from './forms/CategoryForm';
import { ProductForm } from './forms/ProductForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';

// Let's create a simple data table component since '@/components/ui/data-table' is missing
const DataTable = ({ columns, data, isLoading }: { columns: any[]; data: any[]; isLoading: boolean }) => {
  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }
  
  return (
    <div className="border rounded-md">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            {columns.map((column, index) => (
              <th key={index} className="text-left p-2 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-4">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="p-2">
                    {column.cell ? column.cell(row) : row[column.accessorKey]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Create the ProductColumn definition since './columns' is missing
const ProductColumn = [
  {
    header: "Product Name",
    accessorKey: "product_name",
  },
  {
    header: "Price",
    accessorKey: "retail_price",
    cell: (row: any) => `Rp ${parseFloat(row.retail_price).toLocaleString('id-ID')}`,
  },
  {
    header: "Stock",
    accessorKey: "stock",
  },
  {
    header: "Category",
    accessorKey: "kategori_id",
  },
];

const ProductManagement = () => {
  const { pelakuUsaha, cabang } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('product');

  // Product form handlers
  const handleProductSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('produk').insert([
        {
          product_name: formData.productName,
          retail_price: formData.retailPrice,
          cost_price: formData.costPrice,
          stock: formData.stock,
          kategori_id: formData.categoryId,
          unit: formData.unit,
          barcode: formData.barcode,
          cabang_id: cabang?.cabang_id,
          pelaku_usaha_id: pelakuUsaha?.pelaku_usaha_id,
          member_price_1: formData.memberPrice1,
          member_price_2: formData.memberPrice2,
        },
      ]);

      if (error) {
        throw error;
      }
      setIsModalOpen(false);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category form handlers
  const handleCategorySubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('kategori_produk').insert([
        {
          kategori_name: formData.categoryName,
          description: formData.description,
          pelaku_usaha_id: pelakuUsaha?.pelaku_usaha_id,
        },
      ]);

      if (error) {
        throw error;
      }
      setIsModalOpen(false);
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Categories query
  const { data: categories } = useQuery({
    queryKey: ['categories', pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kategori_produk')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsaha?.pelaku_usaha_id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!pelakuUsaha?.pelaku_usaha_id,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', cabang?.cabang_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produk')
        .select('*')
        .eq('cabang_id', cabang?.cabang_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!cabang?.cabang_id,
  });

  const columns = React.useMemo(() => ProductColumn, []);

  return (
    <div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New {activeTab === 'product' ? 'Product' : 'Category'}</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new {activeTab === 'product' ? 'product' : 'category'}.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="product" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="product">Product</TabsTrigger>
              <TabsTrigger value="category">Category</TabsTrigger>
            </TabsList>
            <TabsContent value="product">
              <ProductForm 
                categories={categories || []} 
                onSubmit={handleProductSubmit}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
            <TabsContent value="category">
              <CategoryForm onSubmit={handleCategorySubmit} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <DataTable columns={columns} data={products || []} isLoading={isLoading} />
    </div>
  );
};

export default ProductManagement;
