
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { CashierProfileForm } from "@/components/settings/CashierProfileForm";
import { BusinessForm } from "@/components/settings/BusinessForm";
import { useAuth } from "@/hooks/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { userRole, user, pelakuUsaha } = useAuth();
  const isCashier = userRole === 'kasir';
  const [profileData, setProfileData] = useState({
    userId: "",
    name: "",
    email: ""
  });
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        // Get user's profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setProfileData({
            userId: user.id,
            name: data.full_name || "",
            email: user.email || ""
          });
        }
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  // For cashier role, only show profile settings
  if (isCashier) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <CashierProfileForm />
      </div>
    );
  }
  
  // For business owner, show profile and business settings
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Pengaturan</h1>
      <Tabs defaultValue="business">
        <TabsList className="mb-4">
          <TabsTrigger value="business">Profil Usaha</TabsTrigger>
          <TabsTrigger value="profile">Profil Saya</TabsTrigger>
        </TabsList>
        <TabsContent value="business">
          <BusinessForm />
        </TabsContent>
        <TabsContent value="profile">
          <ProfileForm 
            userId={profileData.userId}
            initialName={profileData.name}
            initialEmail={profileData.email}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
