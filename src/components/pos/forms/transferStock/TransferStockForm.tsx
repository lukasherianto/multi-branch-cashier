
import { Form } from "@/components/ui/form";
import { useTransferStock } from "./useTransferStock";
import { ProductTable } from "./ProductTable";
import { Pagination } from "./Pagination";
import { useState } from "react";
import { DirectionToggle } from "./components/DirectionToggle";
import { BranchSelector } from "./components/BranchSelector";
import { TransferSubmitButton } from "./components/TransferSubmitButton";
import ErrorBoundary from "./components/ErrorBoundary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { Info } from "lucide-react";

export function TransferStockForm() {
  const [renderError, setRenderError] = useState<Error | null>(null);

  try {
    const {
      form,
      isSubmitting,
      branchesLoading,
      cabangList,
      centralBranch,
      sourceBranches,
      destinationBranches,
      fromCentralToBranch,
      toggleDirection,
      selectedProducts,
      paginatedProducts,
      currentPage,
      totalPages,
      handleSearch,
      handleProductSelection,
      handleQuantityChange,
      handlePreviousPage,
      handleNextPage,
      onSubmit,
      ITEMS_PER_PAGE
    } = useTransferStock();

    // If there's a render error, show it
    if (renderError) {
      return <ErrorBoundary error={renderError} />;
    }

    if (branchesLoading) {
      return (
        <div className="p-4 rounded-md bg-gray-50 border text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Memuat data cabang...</p>
        </div>
      );
    }

    // If branches array is undefined or empty
    if (!cabangList || cabangList.length === 0) {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Tidak ada cabang yang tersedia. Silakan tambahkan cabang terlebih dahulu di halaman Pengaturan.
          </AlertDescription>
        </Alert>
      );
    }

    if (cabangList.length < 2) {
      return (
        <Alert variant="destructive">
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
          <DirectionToggle 
            fromCentralToBranch={fromCentralToBranch} 
            toggleDirection={toggleDirection} 
          />

          <BranchSelector 
            form={form} 
            sourceBranches={sourceBranches} 
            destinationBranches={destinationBranches} 
          />

          <div className="mb-4">
            <ProductSearch onSearch={handleSearch} />
          </div>

          <ProductTable 
            products={paginatedProducts}
            onSelectProduct={handleProductSelection}
            onQuantityChange={handleQuantityChange}
            loading={false}
          />

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={selectedProducts.length}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
          />

          <TransferSubmitButton 
            isSubmitting={isSubmitting} 
            form={form}
            selectedProductsCount={selectedProductsCount}
          />
        </form>
      </Form>
    );
  } catch (error) {
    console.error("Uncaught error in TransferStockForm:", error);
    return <ErrorBoundary error={error instanceof Error ? error : new Error(String(error))} />;
  }
}
