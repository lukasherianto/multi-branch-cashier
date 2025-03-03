
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferStockSchema, type TransferStockFormValues } from "./schema";
import { useBranches } from "./hooks/useBranches";
import { useProducts } from "@/hooks/products";
import { CartItem } from "@/types/pos";
import { useToast } from "@/hooks/use-toast";
import { validateStockForTransfer, executeStockTransfer } from "./utils/transferUtils";
import { hooks } from "./hooks";

// Define a type for products with selection state
interface ProductWithSelection extends CartItem {
  selected: boolean;
}

export const useTransferStock = () => {
  const { toast } = useToast();
  const [fromCentralToBranch, setFromCentralToBranch] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with schema validation
  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockSchema),
    defaultValues: {
      cabang_id_from: "",
      cabang_id_to: "",
      products: []
    }
  });
  
  // Get branches data
  const { branches, centralBranch, branchesLoading } = useBranches();
  
  // Determine available source and destination branches based on direction
  const sourceBranches = fromCentralToBranch 
    ? (centralBranch ? [centralBranch] : [])
    : branches.filter(b => b.cabang_id !== centralBranch?.cabang_id);
    
  const destinationBranches = fromCentralToBranch
    ? branches.filter(b => b.cabang_id !== centralBranch?.cabang_id) 
    : (centralBranch ? [centralBranch] : []);
  
  // Products management
  const { products: rawProducts, handleSearch, currentBranchId } = useProducts();
  
  // Add selected state to products
  const [selectedProducts, setSelectedProducts] = useState<ProductWithSelection[]>([]);
  
  // Pagination settings
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.ceil(selectedProducts.length / ITEMS_PER_PAGE);
  
  // Get paginated products for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, selectedProducts.length);
  const paginatedProducts = selectedProducts.slice(startIndex, endIndex);
  
  // Handle direction toggle
  const toggleDirection = () => {
    setFromCentralToBranch(prev => !prev);
    // Reset form values when direction changes
    form.reset({
      cabang_id_from: "",
      cabang_id_to: "",
      products: []
    });
  };
  
  // Handle product selection
  const handleProductSelection = (productId: number, selected: boolean) => {
    setSelectedProducts(prev => 
      prev.map(product => 
        product.id === productId ? { ...product, selected } : product
      )
    );
  };
  
  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    
    // Find product to check stock
    const product = selectedProducts.find(p => p.id === productId);
    
    if (product && quantity > product.stock) {
      toast({
        title: "Warning",
        description: `Jumlah melebihi stok yang tersedia (${product.stock})`,
        variant: "destructive",
      });
      quantity = product.stock; // Cap at max stock
    }
    
    setSelectedProducts(prev => 
      prev.map(product => 
        product.id === productId ? { ...product, quantity } : product
      )
    );
  };
  
  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  // Handle product search with selection state preservation
  const handleProductSearch = (searchTerm: string) => {
    handleSearch(searchTerm);
    // We need to maintain the selected state when filtering
  };
  
  // Form submission handler
  const onSubmit = async (values: TransferStockFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Ensure branches are selected
      if (!values.cabang_id_from || !values.cabang_id_to) {
        toast({
          title: "Error",
          description: "Pilih cabang asal dan tujuan",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Get selected products
      const productsToTransfer = selectedProducts.filter(p => p.selected);
      
      if (productsToTransfer.length === 0) {
        toast({
          title: "Error",
          description: "Pilih minimal satu produk",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Validate stock availability
      const stockValid = await validateStockForTransfer(
        productsToTransfer, 
        values.cabang_id_from
      );
      
      if (!stockValid) {
        setIsSubmitting(false);
        return;
      }
      
      // Execute the transfer
      const transferId = await executeStockTransfer(values, productsToTransfer);
      
      if (transferId) {
        toast.success(`Transfer stok berhasil dengan nomor: ${transferId}`);
        // Reset form
        form.reset({
          cabang_id_from: "",
          cabang_id_to: "",
          products: []
        });
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error("Transfer submission error:", error);
      toast({
        title: "Error",
        description: `Gagal melakukan transfer stok: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
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
    handleSearch: handleProductSearch,
    handleProductSelection,
    handleQuantityChange,
    handlePreviousPage,
    handleNextPage,
    onSubmit,
    ITEMS_PER_PAGE
  };
};
