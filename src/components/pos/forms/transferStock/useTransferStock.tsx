
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useBranchSelection } from "./hooks/useBranchSelection";
import { useProducts } from "./hooks/useProducts";
import { toast } from "sonner";
import { executeStockTransfer } from "./utils/transferUtils";
import { schema } from "./schema";
import { ProductWithSelection, TransferStockFormValues } from "@/types/pos";
import { useAuth } from "@/hooks/useAuth";

export const useTransferStock = () => {
  const { cabangList } = useAuth();
  const [fromCentralToBranch, setFromCentralToBranch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductWithSelection[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<ProductWithSelection[]>([]);
  const ITEMS_PER_PAGE = 10;
  const [centralBranch, setCentralBranch] = useState<any>(null);
  const [sourceBranches, setSourceBranches] = useState<any[]>([]);
  const [destinationBranches, setDestinationBranches] = useState<any[]>([]);

  // Initialize the form
  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cabang_id_from: "",
      cabang_id_to: "",
      products: [],
      notes: ""
    }
  });

  // Setup branches when cabangList is loaded
  useEffect(() => {
    if (!cabangList || cabangList.length === 0) return;
    
    console.log("Setting up branches with cabangList:", cabangList);
    setBranchesLoading(true);
    
    try {
      // Identify the central branch (first/lowest ID)
      const sortedBranches = [...cabangList].sort((a, b) => a.cabang_id - b.cabang_id);
      const central = sortedBranches[0];
      setCentralBranch(central);
      
      console.log("Central branch identified:", central);
      
      if (fromCentralToBranch) {
        // From central to branch: source is central, destinations are all others
        setSourceBranches([central]);
        setDestinationBranches(sortedBranches.filter(b => b.cabang_id !== central.cabang_id));
        
        // Auto-select central as source
        form.setValue('cabang_id_from', central.cabang_id.toString());
        console.log("Auto-selected central branch as source:", central.cabang_id.toString());
      } else {
        // From branch to central: sources are all branches, destination is central
        setSourceBranches(sortedBranches);
        setDestinationBranches(sortedBranches);
      }
    } catch (error) {
      console.error("Error setting up branches:", error);
    } finally {
      setBranchesLoading(false);
    }
  }, [cabangList, fromCentralToBranch, form]);

  // Toggle direction changes how branches are filtered
  const toggleDirection = () => {
    setFromCentralToBranch(prev => !prev);
    // Reset the form values when direction changes
    form.setValue('cabang_id_from', '');
    form.setValue('cabang_id_to', '');
  };

  // Watch for source branch changes to load products
  const sourceBranchId = form.watch("cabang_id_from");
  
  console.log("Current source branch ID:", sourceBranchId);
  
  // Get products for the selected source branch
  const { 
    filteredProducts, 
    loading: productsLoading, 
    handleSearch,
    setFilteredProducts 
  } = useProducts(sourceBranchId);

  // Update paginated products when currentPage or filteredProducts change
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    console.log(`Updating paginated products: ${startIndex}-${endIndex} of ${filteredProducts.length}`);
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
    
    // Update selectedProducts when filteredProducts change
    setSelectedProducts(filteredProducts.filter(p => p.selected));
  }, [currentPage, filteredProducts]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Handle product selection
  const handleProductSelection = (productId: number, selected: boolean) => {
    console.log(`Selection change for product ${productId}: ${selected}`);
    const updatedProducts = filteredProducts.map(product => 
      product.id === productId ? { ...product, selected } : product
    );
    setFilteredProducts(updatedProducts);
  };

  // Handle quantity change
  const handleQuantityChange = (productId: number, quantity: number) => {
    console.log(`Quantity change for product ${productId}: ${quantity}`);
    const updatedProducts = filteredProducts.map(product => 
      product.id === productId ? { ...product, quantity } : product
    );
    setFilteredProducts(updatedProducts);
  };

  // Handle form submission
  const onSubmit = async (data: TransferStockFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (selectedProducts.length === 0) {
        toast("Pilih minimal satu produk untuk ditransfer");
        return;
      }

      console.log("Submitting transfer with data:", data);
      console.log("Selected products:", selectedProducts);

      // Execute transfer operation
      const transferId = await executeStockTransfer(data, selectedProducts);
      
      if (transferId) {
        toast(`Transfer stok berhasil dengan ID: ${transferId}`);
        
        // Reset form and selection
        form.reset();
        setFilteredProducts([]);
        setSelectedProducts([]);
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
    branchesLoading,
    productsLoading,
    isSubmitting,
    cabangList,
    centralBranch,
    sourceBranches,
    destinationBranches,
    fromCentralToBranch,
    toggleDirection,
    selectedProducts,
    paginatedProducts,
    handleSearch,
    currentPage,
    totalPages,
    handlePreviousPage,
    handleNextPage,
    ITEMS_PER_PAGE,
    handleProductSelection,
    handleQuantityChange
  };
};
