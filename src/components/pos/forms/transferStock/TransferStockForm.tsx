
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { useTransferStock } from "./useTransferStock";
import { ProductTable } from "./ProductTable";
import { Pagination } from "./Pagination";
import { useEffect, useState } from "react";
import { AlertTriangle, Info, ArrowUpDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function TransferStockForm() {
  const [renderError, setRenderError] = useState<Error | null>(null);

  try {
    const {
      form,
      isSubmitting,
      branchesLoading,
      branches,
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

    // Add logging when component mounts
    useEffect(() => {
      try {
        console.log("TransferStockForm mounted");
        console.log("Branches loaded:", branches);
        console.log("Central branch:", centralBranch);
        console.log("Source branches:", sourceBranches);
        console.log("Destination branches:", destinationBranches);
      } catch (error) {
        console.error("Error in TransferStockForm useEffect:", error);
        setRenderError(error as Error);
      }
    }, [branches, centralBranch, sourceBranches, destinationBranches]);

    // If there's a render error, show it
    if (renderError) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {renderError.message}
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {renderError.stack}
              </pre>
            </AlertDescription>
          </Alert>
        </div>
      );
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
    if (!branches || branches.length === 0) {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Informasi</AlertTitle>
          <AlertDescription>
            Tidak ada cabang yang tersedia. Silakan tambahkan cabang terlebih dahulu di halaman Pengaturan.
          </AlertDescription>
        </Alert>
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
          <div className="flex items-center justify-end mb-4">
            <span className="text-sm mr-2">
              {fromCentralToBranch ? "Pusat ke Cabang" : "Cabang ke Pusat"}
            </span>
            <div className="flex items-center space-x-2">
              <Switch
                checked={!fromCentralToBranch}
                onCheckedChange={() => toggleDirection()}
                aria-label="Toggle transfer direction"
              />
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cabang_id_from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dari Cabang</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih cabang asal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sourceBranches.map((branch) => (
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

            <FormField
              control={form.control}
              name="cabang_id_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ke Cabang</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
            disabled={isSubmitting || form.getValues("cabang_id_from") === "" || 
                      form.getValues("cabang_id_to") === "" || 
                      selectedProducts.filter(p => p.selected).length === 0}
            className="w-full md:w-auto"
          >
            {isSubmitting ? "Memproses..." : "Transfer Stok"}
          </Button>
        </form>
      </Form>
    );
  } catch (error) {
    console.error("Uncaught error in TransferStockForm:", error);
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Terjadi kesalahan saat memuat form transfer stok. Silakan coba muat ulang halaman.
            {error instanceof Error && (
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {error.message}
                {error.stack}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
