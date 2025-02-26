
import { PurchaseForm } from "@/components/kas/purchases/PurchaseForm";

const KasPurchases = () => {
  return (
    <div className="container mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold mb-4">Pembelian Baru</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <PurchaseForm />
      </div>
    </div>
  );
};

export default KasPurchases;
