
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Branch = {
  cabang_id: number;
  branch_name: string;
  address?: string;
  contact_whatsapp?: string;
  status?: number;
};

export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [centralBranch, setCentralBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          throw new Error('User not authenticated');
        }
        
        const { data: pelakuUsaha, error: pelakuUsahaError } = await supabase
          .from('pelaku_usaha')
          .select('pelaku_usaha_id')
          .eq('user_id', userData.user.id)
          .single();
          
        if (pelakuUsahaError) throw pelakuUsahaError;
        
        if (pelakuUsaha) {
          const { data: branchesData, error: branchesError } = await supabase
            .from('cabang')
            .select('cabang_id, branch_name, address, contact_whatsapp, status')
            .eq('pelaku_usaha_id', pelakuUsaha.pelaku_usaha_id)
            .order('cabang_id', { ascending: true });
            
          if (branchesError) throw branchesError;
          
          if (branchesData && branchesData.length > 0) {
            setBranches(branchesData);
            
            // Find central branch (status = 1)
            const headBranch = branchesData.find(b => b.status === 1) || branchesData[0];
            setCentralBranch(headBranch);
          }
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data cabang",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBranches();
  }, [toast]);
  
  return { branches, centralBranch, branchesLoading: loading };
};
