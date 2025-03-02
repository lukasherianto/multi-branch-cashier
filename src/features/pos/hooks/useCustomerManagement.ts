
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

  const handleCustomerFound = (customer: any) => {
    console.log('Customer found:', customer);
    setIsRegisteredCustomer(true);
    setMemberId(customer.member_id);
    setMemberPoints(customer.loyalty_points || 0);
  };

  const handleNewCustomer = () => {
    console.log('New customer initiated');
    setIsRegisteredCustomer(false);
    setMemberId(null);
    setMemberPoints(0);
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
    handleCustomerFound,
    handleNewCustomer
  };
};
