
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { useTransferStock } from "./useTransferStock";
import { ProductTable } from "./ProductTable";
import { Pagination } from "./Pagination";
import { useEffect } from "react";

export function TransferStockForm() {
  const {
    form,
    isSubmitting,
    branchesLoading,
    branches,
    centralBranch,
    destinationBranches,
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

  // Add logging when component mounts
  useEffect(() => {
    console.log("TransferStockForm mounted");
    console.log("Branches loaded:", branches);
    console.log("Central branch:", centralBranch);
    console.log("Destination branches:", destinationBranches);
  }, [branches, centralBranch, destinationBranches]);

  if (branchesLoading) {
    return (
      <div className="p-4 rounded-md bg-gray-50 border text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
        <p>Memuat data cabang...</p>
      </div>
    );
  }

  if (branches.length < 2) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Minimal harus ada 2 cabang untuk melakukan transfer stok. Silakan tambahkan cabang terlebih dahulu.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Dari Cabang (Pusat)</FormLabel>
            <div className="rounded-md border px-3 py-2 text-sm bg-gray-50">
              {centralBranch?.branch_name || "Cabang Pusat"}
            </div>
          </FormItem>

          <FormField
            control={form.control}
            name="cabang_id_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ke Cabang</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih cabang tujuan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {destinationBranches.map((branch) => (
                      <SelectItem key={branch.cabang_id} value={branch.cabang_id.toString()}>
                        {branch.branch_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <Button 
          type="submit" 
          disabled={isSubmitting || selectedProducts.filter(p => p.selected).length === 0}
          className="w-full md:w-auto"
        >
          {isSubmitting ? "Memproses..." : "Transfer Stok"}
        </Button>
      </form>
    </Form>
  );
}
