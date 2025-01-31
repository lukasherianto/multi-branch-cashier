interface CategoryListProps {
  categories: Array<{ kategori_name: string; description: string | null }>;
}

export const CategoryList = ({ categories }: CategoryListProps) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Daftar Kategori</h3>
      <div className="border rounded-lg divide-y">
        {categories.map((category, index) => (
          <div key={index} className="p-3">
            <h4 className="font-medium">{category.kategori_name}</h4>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="p-3 text-gray-500">Belum ada kategori</p>
        )}
      </div>
    </div>
  );
};