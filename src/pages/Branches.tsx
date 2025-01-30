import { Card } from "@/components/ui/card";
import { Building, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Branches = () => {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "Anda harus login terlebih dahulu",
          variant: "destructive",
        });
        return;
      }

      console.log("User ID before conversion:", user.id);
      const userId = parseInt(user.id);
      console.log("User ID after conversion:", userId);

      if (isNaN(userId)) {
        toast({
          title: "Error",
          description: "ID pengguna tidak valid",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("pelaku_usaha").insert({
        business_name: businessName,
        contact_whatsapp: whatsapp,
        user_id: userId,
      });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast({
        title: "Berhasil",
        description: "Data pelaku usaha berhasil ditambahkan",
      });

      // Reset form
      setBusinessName("");
      setWhatsapp("");
    } catch (error) {
      console.error("Error adding pelaku usaha:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan data pelaku usaha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Form Pelaku Usaha */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Tambah Pelaku Usaha</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Nama Usaha</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Masukkan nama usaha"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
            <Input
              id="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Contoh: 08123456789"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </Card>

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