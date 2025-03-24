
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessForm } from "@/components/settings/BusinessForm";
import { BranchForm } from "@/components/settings/BranchForm";
import { EmployeeForm } from "@/components/settings/EmployeeForm";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { CashierProfileForm } from "@/components/settings/CashierProfileForm";
import { useAuth } from "@/hooks/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { userRole, user } = useAuth();
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
  
  // For business owner, show all settings
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Pengaturan</h1>
      <Tabs defaultValue="business">
        <TabsList className="mb-4">
          <TabsTrigger value="business">Profil Usaha</TabsTrigger>
          <TabsTrigger value="branches">Cabang</TabsTrigger>
          <TabsTrigger value="employee">Karyawan</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>
        <TabsContent value="business">
          <BusinessForm />
        </TabsContent>
        <TabsContent value="branches">
          <BranchForm />
        </TabsContent>
        <TabsContent value="employee">
          <EmployeeForm />
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
