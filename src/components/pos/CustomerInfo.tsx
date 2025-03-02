
import { useState } from "react";
import { User } from "lucide-react";
import { WhatsAppInput } from "@/components/settings/WhatsAppInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface CustomerInfoProps {
  whatsappNumber: string;
  setWhatsappNumber: (value: string) => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  birthDate: Date | null;
  setBirthDate: (value: Date | null) => void;
  onCustomerFound: (customer: any) => void; 
  onNewCustomer: () => void;
  memberType: "none" | "member1" | "member2";
  onChangeMemberType: (type: "none" | "member1" | "member2") => void;
  isRegisteredCustomer: boolean;
}

export const CustomerInfo = ({
  whatsappNumber,
  setWhatsappNumber,
  customerName,
  setCustomerName,
  birthDate,
  setBirthDate,
  onCustomerFound,
  onNewCustomer,
  memberType,
  onChangeMemberType,
  isRegisteredCustomer
}: CustomerInfoProps) => {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      memberType: memberType
    }
  });

  const handleCheckCustomer = async () => {
    if (whatsappNumber.length < 10) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Nomor WhatsApp tidak valid",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pelanggan')
        .select('*')
        .eq('whatsapp', whatsappNumber)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCustomerName(data.nama);
        setBirthDate(null);
        onCustomerFound(data);
        toast({
          title: "Data Pelanggan Ditemukan",
          description: `Selamat datang kembali, ${data.nama}!`,
        });
      } else {
        setCustomerName("");
        setBirthDate(null);
        onNewCustomer();
        toast({
          title: "Pelanggan Baru",
          description: "Pelanggan tidak ditemukan. Transaksi akan menggunakan harga retail.",
        });
      }
    } catch (error: any) {
      console.error('Error fetching customer data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengambil data pelanggan",
      });
    }
  };

  return (
    <div className="space-y-4">
      <WhatsAppInput
        value={whatsappNumber}
        onChange={setWhatsappNumber}
        onCheck={handleCheckCustomer}
        onSave={null}
      />

      {isRegisteredCustomer && (
        <div className="p-3 bg-gray-100 rounded-md">
          <p className="font-medium">Pelanggan: {customerName}</p>
          <p className="text-sm text-gray-600">Tipe Member: {memberType === "none" ? "Non-Member" : memberType === "member1" ? "Member 1" : "Member 2"}</p>
        </div>
      )}

      {isRegisteredCustomer && (
        <Form {...form}>
          <FormField
            control={form.control}
            name="memberType"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Tipe Member</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      onChangeMemberType(value as "none" | "member1" | "member2");
                    }}
                    defaultValue={memberType}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="none" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Non-Member (Harga Retail)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="member1" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Member 1
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="member2" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Member 2
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      )}
    </div>
  );
};
