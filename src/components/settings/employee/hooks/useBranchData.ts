
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Branch } from "../types";
import { useAuth } from "@/hooks/auth";

export const useBranchData = () => {
  const { toast } = useToast();
  const { user, pelakuUsaha } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);

  const loadBranches = async () => {
    try {
      console.log("Loading branches...");
      if (!user) {
        console.error("No authenticated user");
        return;
      }

      const businessId = pelakuUsaha?.pelaku_usaha_id 
        ? (typeof pelakuUsaha.pelaku_usaha_id === 'string' 
          ? parseInt(pelakuUsaha.pelaku_usaha_id, 10) 
          : pelakuUsaha.pelaku_usaha_id)
        : null;

      if (!businessId) {
        console.error("Cannot determine business ID");
        return;
      }

      const { data: branchesData, error } = await supabase
        .from("cabang")
        .select("*")
        .eq("pelaku_usaha_id", businessId);

      if (error) throw error;
      console.log("Branches loaded:", branchesData);
      setBranches(branchesData || []);
    } catch (error) {
      console.error("Error loading branches:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data cabang",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadBranches();
    }
  }, [user, pelakuUsaha]);

  return {
    branches,
    loadBranches,
  };
};
