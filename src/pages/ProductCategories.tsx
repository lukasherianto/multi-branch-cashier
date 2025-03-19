
import React from 'react';
import { CategoryManagement } from "@/components/pos/CategoryManagement";
import { useAuth } from "@/hooks/auth";

const ProductCategories = () => {
  const { userRole } = useAuth();
  const isCashier = userRole === 'kasir';
  
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Kategori Produk</h2>
      <CategoryManagement hiddenAddButton={isCashier} />
    </div>
  );
};

export default ProductCategories;
