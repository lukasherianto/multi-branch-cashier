
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerManagement = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [isRegisteredCustomer, setIsRegisteredCustomer] = useState(false);
  const [memberId, setMemberId] = useState<number | null>(null);
  const [memberPoints, setMemberPoints] = useState<number>(0);
  const [memberType, setMemberType] = useState<"none" | "member1" | "member2">("none");

  const handleCustomerFound = (customer: any) => {
    console.log('Customer found:', customer);
    setIsRegisteredCustomer(true);
    setMemberId(customer.member_id);
    setMemberPoints(customer.loyalty_points || 0);
    
    // Set member type based on database value or default to member1
    const type = customer.member_type || "member1";
    setMemberType(type);
  };

  const handleNewCustomer = () => {
    console.log('New customer initiated');
    setIsRegisteredCustomer(false);
    setMemberId(null);
    setMemberPoints(0);
    setMemberType("none");
  };

  const handleChangeMemberType = async (type: "none" | "member1" | "member2") => {
    setMemberType(type);
    
    // If customer is registered, update their member type in database
    if (isRegisteredCustomer && memberId) {
      try {
        const { error } = await supabase
          .from('pelanggan')
          .update({ member_type: type })
          .eq('pelanggan_id', memberId);
        
        if (error) throw error;
        
        toast.success(`Tipe member berhasil diubah ke ${type === "member1" ? "Member 1" : type === "member2" ? "Member 2" : "Non-member"}`);
      } catch (error) {
        console.error('Error updating member type:', error);
        toast.error("Gagal mengubah tipe member");
      }
    }
  };

  return {
    whatsappNumber,
    setWhatsappNumber,
    customerName,
    setCustomerName,
    birthDate,
    setBirthDate,
    isRegisteredCustomer,
    setIsRegisteredCustomer,
    memberId,
    setMemberId,
    memberPoints,
    setMemberPoints,
    memberType,
    setMemberType,
    handleCustomerFound,
    handleNewCustomer,
    handleChangeMemberType
  };
};
