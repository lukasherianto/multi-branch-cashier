
import React, { useState } from "react";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { ProductTable } from "./ProductTable";
import { Pagination } from "@/components/pos/forms/transferStock/Pagination";
import { Info } from "lucide-react";
import { BranchSelector } from "./BranchSelector";
import { TransferSubmitButton } from "./TransferSubmitButton";
import { useTransferToBranch } from "./useTransferToBranch";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function TransferToBranchForm() {
  const [renderError, setRenderError] = useState<Error | null>(null);

  try {
    const {
      form,
      isSubmitting,
      branchesLoading,
      branches,
      destinationBranches,
      selectedProducts,
      paginatedProducts,
      currentPage,
      totalPages,
      totalCostPrice,
      handleSearch,
      handleProductSelection,
      handleQuantityChange,
      handlePreviousPage,
      handleNextPage,
      onSubmit,
      ITEMS_PER_PAGE
    } = useTransferToBranch();

    if (branchesLoading) {
      return (
        <div className="p-4 rounded-md bg-gray-50 border text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Memuat data cabang...</p>
        </div>
      );
    }

    // If branches array is undefined or empty
    if (!branches || branches.length === 0) {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Tidak ada cabang yang tersedia. Silakan tambahkan cabang terlebih dahulu di halaman Pengaturan.
          </AlertDescription>
        </Alert>
      );
    }

    if (branches.length < 2) {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Minimal harus ada 2 cabang untuk melakukan transfer stok. Silakan tambahkan cabang terlebih dahulu.
          </AlertDescription>
        </Alert>
      );
    }

    const selectedProductsCount = selectedProducts.filter(p => p.selected).length;

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <p className="text-blue-800 font-medium">Mode Transfer: Pusat ke Cabang</p>
            <p className="text-sm text-blue-600 mt-1">
              Produk akan ditransfer dari pusat ke cabang yang dipilih.
            </p>
          </div>

          <BranchSelector 
            form={form} 
            destinationBranches={destinationBranches} 
          />

          <div className="mb-4">
            <ProductSearch onSearch={handleSearch} />
          </div>

          <ProductTable 
            paginatedProducts={paginatedProducts}
            handleProductSelection={handleProductSelection}
            handleQuantityChange={handleQuantityChange}
          />

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={selectedProducts.length}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />

          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Nilai Barang (Harga Modal):</p>
                <p className="text-lg font-bold">Rp {totalCostPrice.toLocaleString('id-ID')}</p>
              </div>
            </CardContent>
          </Card>

          <TransferSubmitButton 
            isSubmitting={isSubmitting} 
            form={form}
            selectedProductsCount={selectedProductsCount}
          />
        </form>
      </Form>
    );
  } catch (error) {
    console.error("Uncaught error in TransferToBranchForm:", error);
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Terjadi kesalahan saat memuat form transfer. Silakan coba muat ulang halaman.
        </AlertDescription>
      </Alert>
    );
  }
}
