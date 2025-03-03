import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { schema } from "./schema";
import { ProductWithSelection, TransferToBranchValues } from "@/types/pos";
import { useAuth } from "@/hooks/useAuth";
import { useCentralProducts } from "./useCentralProducts";
import { transferToBranch } from "./transferToBranchUtils";
import { usePagination } from "./usePagination";

export const useTransferToBranch = () => {
  const { cabangList } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductWithSelection[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const form = useForm<TransferToBranchValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cabang_id_to: "",
      products: [],
      notes: ""
    }
  });

  const { products, loading, handleSearch, fetchProducts } = useCentralProducts();
  const { paginatedProducts, totalPages } = usePagination(products, currentPage, ITEMS_PER_PAGE);

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleProductSelection = (productId: number, selected: boolean) => {
    const updatedProducts = products.map(product =>
      product.id === productId ? { ...product, selected } : product
    );
    setSelectedProducts(updatedProducts);
    fetchProducts(updatedProducts);
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    const updatedProducts = products.map(product =>
      product.id === productId ? { ...product, quantity } : product
    );
    setSelectedProducts(updatedProducts);
    fetchProducts(updatedProducts);
  };

  const onSubmit = async (data: TransferToBranchValues) => {
    try {
      setIsSubmitting(true);

      const productsToTransfer = products.filter(p => p.selected);

      if (productsToTransfer.length === 0) {
        toast("Pilih minimal satu produk untuk ditransfer");
        return;
      }

      const success = await transferToBranch(data, productsToTransfer);

      if (success) {
        toast(`Transfer stok berhasil dilakukan`);
        form.reset();
        fetchProducts([]);
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
    cabangList,
    products,
    loading,
    selectedProducts,
    paginatedProducts,
    currentPage,
    totalPages,
    ITEMS_PER_PAGE,
    handleSearch,
    handlePreviousPage,
    handleNextPage,
    handleProductSelection,
    handleQuantityChange
  };
};
