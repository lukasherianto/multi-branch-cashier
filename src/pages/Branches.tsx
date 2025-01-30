import { Card } from "@/components/ui/card";
import { Building, Phone, MapPin } from "lucide-react";

const Branches = () => {
  const branches = [
    {
      name: "Cabang Pusat",
      address: "Jl. Veteran No. 45, Bengkulu",
      contact: "0821-xxxx-xxxx",
    },
    {
      name: "Cabang Panorama",
      address: "Jl. Panorama No. 12, Bengkulu",
      contact: "0822-xxxx-xxxx",
    },
    {
      name: "Cabang Unib",
      address: "Jl. WR Supratman, Bengkulu",
      contact: "0823-xxxx-xxxx",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Cabang</h2>
        <p className="text-gray-600 mt-2">Kelola informasi cabang Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-mint-50 p-2 rounded-lg">
                <Building className="w-5 h-5 text-mint-600" />
              </div>
              <h3 className="font-semibold text-gray-800">{branch.name}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{branch.address}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{branch.contact}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Branches;