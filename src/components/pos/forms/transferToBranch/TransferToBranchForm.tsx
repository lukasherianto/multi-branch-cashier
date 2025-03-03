
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { AlertTriangle, ArrowDown } from "lucide-react";
import { useTransferToBranch } from "./useTransferToBranch";
import { Form } from "@/components/ui/form";
import { ProductTable } from "./ProductTable";
import { BranchSelector } from "./BranchSelector";
import { TransferSubmitButton } from "./TransferSubmitButton";

export function TransferToBranchForm() {
  const {
    form,
    isSubmitting,
    branchesLoading,
    productsLoading,
    centralBranch,
    destinationBranches,
    paginatedProducts,
    totalCostPrice,
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    onSubmit
  } = useTransferToBranch();

  if (branchesLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-10 w-10 border-t-2 border-primary rounded-full mx-auto mb-4"></div>
        <p>Memuat data cabang...</p>
      </div>
    );
  }

  if (!centralBranch) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Cabang Pusat tidak ditemukan. Pastikan Anda telah mengatur cabang pusat dengan benar.
        </AlertDescription>
      </Alert>
    );
  }

  if (destinationBranches.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Tidak ada cabang tujuan yang tersedia. Silakan tambahkan cabang terlebih dahulu.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-lg flex items-center space-x-4">
          <div className="flex-1">
            <div className="text-sm font-medium">Dari</div>
            <div className="text-lg font-semibold">{centralBranch.branch_name} (Pusat)</div>
          </div>
          <ArrowDown className="text-gray-400" />
          <div className="flex-1">
            <BranchSelector form={form} destinationBranches={destinationBranches} />
          </div>
        </div>

        <div className="space-y-4">
          <ProductSearch onSearch={handleSearch} />
          
          {productsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto mb-2"></div>
              <p>Memuat produk...</p>
            </div>
          ) : (
            <ProductTable 
              products={paginatedProducts} 
              onProductSelect={handleProductSelection}
              onQuantityChange={handleQuantityChange}
            />
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-4">
            <div className="text-lg font-medium">Total Nilai Transfer:</div>
            <div className="text-xl font-bold">Rp {totalCostPrice.toLocaleString('id-ID')}</div>
          </div>
          
          <TransferSubmitButton isSubmitting={isSubmitting} />
        </div>
      </form>
    </Form>
  );
}
