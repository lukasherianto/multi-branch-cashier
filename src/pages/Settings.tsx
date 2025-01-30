import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound, Store } from "lucide-react";

const Settings = () => {
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

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">Profil Pengguna</h3>
                <p className="text-sm text-gray-500">
                  Kelola informasi profil Anda
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" placeholder="Masukkan nama lengkap" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Masukkan email" />
              </div>
              <Button>Simpan Perubahan</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Data Pelaku Usaha</h3>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;