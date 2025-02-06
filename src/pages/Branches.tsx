import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Building, Phone, MapPin, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface Branch {
  cabang_id: number;
  branch_name: string;
  address: string | null;
  contact_whatsapp: string | null;
}

const Branches = () => {
  const { toast } = useToast();
  const { pelakuUsaha } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pelakuUsaha) {
      loadBranches();
    }
  }, [pelakuUsaha]);

  const loadBranches = async () => {
    try {
      console.log("Loading branches for pelaku_usaha_id:", pelakuUsaha?.pelaku_usaha_id);
      const { data, error } = await supabase
        .from("cabang")
        .select("*")
        .eq("pelaku_usaha_id", pelakuUsaha?.pelaku_usaha_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading branches:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data cabang",
          variant: "destructive",
        });
        return;
      }

      console.log("Loaded branches:", data);
      setBranches(data || []);
    } catch (error) {
      console.error("Error in loadBranches:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-mint-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Cabang</h2>
          <p className="text-gray-600 mt-2">Kelola informasi cabang Anda</p>
        </div>
        <Link to="/settings?tab=branches">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Cabang
          </Button>
        </Link>
      </div>

      {branches.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Building className="w-12 h-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Belum ada cabang</h3>
              <p className="text-gray-600 mt-1">Mulai dengan menambahkan cabang pertama Anda</p>
            </div>
            <Link to="/settings?tab=branches">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Cabang
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <Card key={branch.cabang_id} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-mint-50 p-2 rounded-lg">
                  <Building className="w-5 h-5 text-mint-600" />
                </div>
                <h3 className="font-semibold text-gray-800">{branch.branch_name}</h3>
              </div>
              <div className="space-y-3">
                {branch.address && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{branch.address}</span>
                  </div>
                )}
                {branch.contact_whatsapp && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{branch.contact_whatsapp}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Branches;