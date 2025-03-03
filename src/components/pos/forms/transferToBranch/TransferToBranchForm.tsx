
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductTable } from "./ProductTable";
import { Pagination } from "../transferStock/Pagination";
import { TransferSubmitButton } from "./TransferSubmitButton";
import { BranchSelector } from "./BranchSelector";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useTransferToBranch } from "./useTransferToBranch";
import { ProductSearch } from "@/components/pos/ProductSearch";

export const TransferToBranchForm = () => {
  const {
    form,
    onSubmit,
    branchOptions,
    isSubmitting,
    branchesLoading,
    productsLoading,
    centralBranch,
    destinationBranches,
    paginatedProducts,
    totalCostPrice,
    handleSearch,
    currentPage,
    totalPages,
    totalItems,
    handleNextPage,
    handlePreviousPage,
    ITEMS_PER_PAGE,
    handleProductSelection,
    handleQuantityChange
  } = useTransferToBranch();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transfer Stok dari Pusat ke Cabang</CardTitle>
        <CardDescription>
          Transfer stok dari cabang pusat ({centralBranch?.branch_name || 'Loading...'}) ke cabang lainnya
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Branch Selection */}
            <div className="grid grid-cols-1 gap-6">
              <BranchSelector
                form={form}
                branchOptions={branchOptions}
                loading={branchesLoading}
              />
            </div>
            
            {/* Product Filter */}
            <div className="mb-4">
              <ProductSearch onSearch={handleSearch} />
            </div>
            
            {/* Product Table */}
            <ProductTable
              products={paginatedProducts}
              loading={productsLoading}
              onSelectProduct={handleProductSelection}
              onQuantityChange={handleQuantityChange}
            />
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalItems}
              onNextPage={handleNextPage}
              onPreviousPage={handlePreviousPage}
            />
            
            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Transfer</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Catatan untuk transfer stok ini (opsional)"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-4">
            <div className="text-lg font-semibold">
              Total Biaya Modal: Rp {totalCostPrice.toLocaleString('id-ID')}
            </div>
            
            <TransferSubmitButton isSubmitting={isSubmitting} />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
