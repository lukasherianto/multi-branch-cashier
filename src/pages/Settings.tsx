import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, Store, GitBranch, Loader2 } from "lucide-react";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { BusinessForm } from "@/components/settings/BusinessForm";
import { BranchForm } from "@/components/settings/BranchForm";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        navigate('/auth');
        return;
      }

      if (!user) {
        console.log("No authenticated user found");
        navigate('/auth');
        return;
      }

      console.log("Authenticated user:", user);
      
      // Get user data from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user data:", userError);
        toast({
          title: "Error",
          description: "Gagal memuat data pengguna",
          variant: "destructive",
        });
        return;
      }

      if (userData) {
        console.log("User data loaded:", userData);
        setUserId(user.id);
        setName(userData.name || '');
        setEmail(userData.email || '');
      } else {
        console.log("No user data found");
        toast({
          title: "Info",
          description: "Data pengguna tidak ditemukan",
        });
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat profil",
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
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Pengaturan</h2>
        <p className="text-gray-600 mt-2">Kelola pengaturan aplikasi Anda</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="profile" className="space-x-2 data-[state=active]:bg-mint-50 data-[state=active]:text-mint-600">
            <UserRound className="w-4 h-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="space-x-2 data-[state=active]:bg-mint-50 data-[state=active]:text-mint-600">
            <Store className="w-4 h-4" />
            <span>Data Usaha</span>
          </TabsTrigger>
          <TabsTrigger value="branches" className="space-x-2 data-[state=active]:bg-mint-50 data-[state=active]:text-mint-600">
            <GitBranch className="w-4 h-4" />
            <span>Cabang</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <ProfileForm
              userId={userId}
              initialName={name}
              initialEmail={email}
            />
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <BusinessForm />
        </TabsContent>

        <TabsContent value="branches">
          <BranchForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;