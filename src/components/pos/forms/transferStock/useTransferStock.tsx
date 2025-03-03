
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { transferStockSchema, type TransferStockFormValues, type ProductTransfer, ITEMS_PER_PAGE } from "./schema";

export function useTransferStock() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [selectedProducts, setSelectedProducts] = useState<ProductTransfer[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductTransfer[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [centralBranchId, setCentralBranchId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockSchema),
    defaultValues: {
      products: []
    }
  });

  const { data: pelakuUsaha } = useQuery({
    queryKey: ['pelakuUsaha', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('pelaku_usaha')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: branches = [], isLoading: branchesLoading } = useQuery({
    queryKey: ['branches', pelakuUsaha?.pelaku_usaha_id],
    queryFn: async () => {
      if (!pelakuUsaha) return [];
      const { data } = await supabase
        .from('cabang')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
        .order('cabang_id', { ascending: true });
      
      // Assuming the first branch is the central branch
      if (data && data.length > 0) {
        setCentralBranchId(data[0].cabang_id.toString());
      }
      
      return data || [];
    },
    enabled: !!pelakuUsaha,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', pelakuUsaha?.pelaku_usaha_id, centralBranchId],
    queryFn: async () => {
      if (!pelakuUsaha || !centralBranchId) return [];
      const { data } = await supabase
        .from('produk')
        .select('*')
        .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
        .order('product_name', { ascending: true });
      
      if (data) {
        const productTransfers = data.map(product => ({
          produk_id: product.produk_id,
          quantity: 0,
          selected: false,
          product_name: product.product_name,
          stock: product.stock
        }));
        setSelectedProducts(productTransfers);
        setFilteredProducts(productTransfers);
      }
      
      return data || [];
    },
    enabled: !!pelakuUsaha && !!centralBranchId,
  });

  useEffect(() => {
    handleSearch(searchTerm);
  }, [selectedProducts, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredProducts(selectedProducts);
      setCurrentPage(0);
      return;
    }

    const filtered = selectedProducts.filter(product => 
      product.product_name.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredProducts(filtered);
    setCurrentPage(0);
  };

  const handleProductSelection = (produk_id: number, checked: boolean) => {
    setSelectedProducts(prev => prev.map(p => 
      p.produk_id === produk_id ? { ...p, selected: checked } : p
    ));
  };

  const handleQuantityChange = (produk_id: number, quantity: number) => {
    setSelectedProducts(prev => prev.map(p => 
      p.produk_id === produk_id ? { ...p, quantity } : p
    ));
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // Get destinations branches (excluding central branch)
  const destinationBranches = branches.filter(branch => 
    branch.cabang_id.toString() !== centralBranchId
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const centralBranch = branches.find(branch => branch.cabang_id.toString() === centralBranchId);

  async function onSubmit(values: TransferStockFormValues) {
    try {
      setIsSubmitting(true);

      const productsToTransfer = selectedProducts.filter(p => p.selected && p.quantity > 0);
      
      if (productsToTransfer.length === 0) {
        toast({
          title: "Error",
          description: "Pilih minimal satu produk untuk ditransfer",
          variant: "destructive",
        });
        return;
      }

      if (!centralBranchId) {
        toast({
          title: "Error",
          description: "Cabang pusat tidak terdeteksi",
          variant: "destructive",
        });
        return;
      }

      for (const product of productsToTransfer) {
        if (product.quantity > product.stock) {
          toast({
            title: "Error",
            description: `Stok ${product.product_name} tidak mencukupi`,
            variant: "destructive",
          });
          return;
        }
      }

      for (const product of productsToTransfer) {
        const { error: transferError } = await supabase
          .from('transfer_stok')
          .insert({
            produk_id: product.produk_id,
            cabang_id_from: parseInt(centralBranchId),
            cabang_id_to: parseInt(values.cabang_id_to),
            quantity: product.quantity,
          });

        if (transferError) throw transferError;

        const { error: updateError } = await supabase
          .from('produk')
          .update({ stock: product.stock - product.quantity })
          .eq('produk_id', product.produk_id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Sukses",
        description: "Transfer stok berhasil dilakukan",
      });

      setSelectedProducts(prev => prev.map(p => ({ ...p, selected: false, quantity: 0 })));
      form.reset();
    } catch (error) {
      console.error('Error transferring stock:', error);
      toast({
        title: "Error",
        description: "Gagal melakukan transfer stok",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    isSubmitting,
    branchesLoading,
    branches,
    centralBranch,
    destinationBranches,
    selectedProducts,
    filteredProducts,
    paginatedProducts,
    currentPage,
    totalPages,
    searchTerm,
    handleSearch,
    handleProductSelection,
    handleQuantityChange,
    handlePreviousPage,
    handleNextPage,
    onSubmit,
    ITEMS_PER_PAGE
  };
}
