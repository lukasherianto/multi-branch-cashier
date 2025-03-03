
import React, { useState } from 'react';
import { Form } from "@/components/ui/form";
import { useTransferToBranch } from "./useTransferToBranch";
import { Card, CardContent } from "@/components/ui/card";
import { BranchSelector } from "./BranchSelector"; // Fixed import syntax - no default export
import { ProductSearch } from "@/components/pos/ProductSearch";
import { ProductTable } from './ProductTable';
import { Pagination } from "@/components/pos/forms/transferStock/Pagination";
import { TransferSubmitButton } from './TransferSubmitButton';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const TransferToBranchForm = () => {
  const [error, setError] = useState<Error | null>(null);

  try {
    const {
      form,
      onSubmit,
      branchOptions,
      branchesLoading,
      productsLoading,
      isSubmitting,
      centralBranch,
      selectedProducts,
      paginatedProducts,
      totalCostPrice,
      currentPage,
      totalPages,
      totalItems,
      handleNextPage,
      handlePreviousPage,
      ITEMS_PER_PAGE,
      handleSearch,
      handleProductSelection,
      handleQuantityChange
    } = useTransferToBranch();

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      );
    }

    const selectedProductsCount = selectedProducts.length;

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <p className="text-sm">Transfer dari: <strong>{centralBranch?.branch_name || 'Cabang Pusat'}</strong></p>
          </div>
          
          <BranchSelector 
            form={form}
            branchOptions={branchOptions} 
            loading={branchesLoading}
          />

          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-2">Pilih Produk</h3>
            <ProductSearch onSearch={handleSearch} />

            <div className="mt-4">
              <ProductTable 
                products={paginatedProducts}
                onSelectProduct={handleProductSelection}
                onQuantityChange={handleQuantityChange}
                loading={productsLoading}
              />
            </div>

            <div className="mt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onNextPage={handleNextPage}
                onPreviousPage={handlePreviousPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={totalItems}
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p>Total produk: <strong>{selectedProductsCount}</strong></p>
                  <p>Total nilai: <strong>Rp {totalCostPrice.toLocaleString('id-ID')}</strong></p>
                </div>
                <TransferSubmitButton 
                  isSubmitting={isSubmitting}
                  selectedProductsCount={selectedProductsCount} 
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    );
  } catch (err) {
    console.error("Error rendering TransferToBranchForm:", err);
    setError(err instanceof Error ? err : new Error(String(err)));
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Terjadi kesalahan saat merender halaman. Silakan coba muat ulang halaman.
        </AlertDescription>
      </Alert>
    );
  }
};
