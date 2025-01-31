import { DollarSign } from "lucide-react";

const Kas = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-8 h-8 text-mint-600" />
        <h1 className="text-2xl font-semibold">Kas</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-medium">Uang Masuk</h2>
          {/* Cash In content will be implemented here */}
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-medium">Uang Keluar</h2>
          {/* Cash Out content will be implemented here */}
        </div>
      </div>
    </div>
  );
};

export default Kas;