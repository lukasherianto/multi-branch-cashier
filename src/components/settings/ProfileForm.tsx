
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  userId: string;
  initialName: string;
  initialEmail: string;
}

export const ProfileForm = ({ userId, initialName, initialEmail }: ProfileFormProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Update user metadata (name) and email if changed
      const updateData: any = {
        data: { name }
      };
      
      // Only update email if it changed
      if (email !== initialEmail) {
        updateData.email = email;
      }
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser(updateData);
      if (updateError) throw updateError;

      // Update password if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password
        });
        if (passwordError) throw passwordError;
      }

      // Update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        // Continue even if profile table update fails
      }

      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
      });
      setPassword(""); // Clear password field after successful update
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>{name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">Profil Pengguna</h3>
          <p className="text-sm text-gray-500">
            Kelola informasi profil Anda
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            value={userId}
            disabled
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password Baru</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kosongkan jika tidak ingin mengubah password"
          />
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </form>
    </div>
  );
};
