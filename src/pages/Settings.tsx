import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, Store } from "lucide-react";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { BusinessForm } from "@/components/settings/BusinessForm";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log("Loading user profile:", user);
        const numericUserId = parseInt(user.id);
        
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', numericUserId)
          .single();

        if (error) throw error;

        if (userData) {
          console.log("User data loaded:", userData);
          setUserId(userData.user_id.toString());
          setName(userData.name || '');
          setEmail(userData.email || '');
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      toast({
        title: "Error",
        description: "Gagal memuat profil pengguna",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Pengaturan</h2>
        <p className="text-gray-600 mt-2">Kelola pengaturan aplikasi Anda</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="space-x-2">
            <UserRound className="w-4 h-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="space-x-2">
            <Store className="w-4 h-4" />
            <span>Data Usaha</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            {!isLoading && (
              <ProfileForm
                userId={userId}
                initialName={name}
                initialEmail={email}
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <BusinessForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;