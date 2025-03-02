
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { WhatsAppInput } from "@/components/settings/WhatsAppInput";
import { toast } from "sonner";

const formSchema = z.object({
  nama: z.string().min(2, { message: "Nama minimal 2 karakter" }),
  whatsapp: z.string().min(10, { message: "Format nomor WhatsApp tidak valid" }),
  member_type: z.enum(["member1", "member2"])
});

type MemberFormValues = z.infer<typeof formSchema>;

interface MemberFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const MemberForm = ({ onCancel, onSuccess }: MemberFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      whatsapp: "",
      member_type: "member1"
    }
  });

  const onSubmit = async (data: MemberFormValues) => {
    setIsSubmitting(true);
    try {
      // Get the current user's pelaku_usaha_id
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      
      const userId = authData.user?.id;
      
      const { data: businessData, error: businessError } = await supabase
        .from('pelaku_usaha')
        .select('pelaku_usaha_id')
        .eq('user_id', userId)
        .single();
      
      if (businessError) throw businessError;
      
      // Insert the new member
      const { error: insertError } = await supabase
        .from('pelanggan')
        .insert({
          nama: data.nama,
          whatsapp: data.whatsapp,
          member_type: data.member_type,
          pelaku_usaha_id: businessData.pelaku_usaha_id
        });
      
      if (insertError) throw insertError;
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving member:', error);
      toast.error("Gagal menyimpan data member: " + (error.message || error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppChange = (value: string) => {
    form.setValue("whatsapp", value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Tambah Member Baru</h2>
        
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor WhatsApp</FormLabel>
              <FormControl>
                <WhatsAppInput 
                  value={field.value}
                  onChange={handleWhatsAppChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Pelanggan</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama pelanggan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="member_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Member</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="member1">Member 1</SelectItem>
                  <SelectItem value="member2">Member 2</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MemberForm;
