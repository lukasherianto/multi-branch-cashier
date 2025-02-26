
import { CategoryManagement } from "@/components/pos/CategoryManagement";

const ProductCategories = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Kategori Produk</h2>
      <CategoryManagement />
    </div>
  );
};

export default ProductCategories;
