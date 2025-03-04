
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TransferHistory {
  id: number;
  nomor_transfer: string;
  nama_produk: string;
  jumlah_produk: number;
  satuan: string;
  tanggal_transfer: string;
  cabang_id_from: number;
  cabang_id_to: number;
  from_branch_name?: string;
  to_branch_name?: string;
}

interface TransferHistoryListProps {
  limit?: number;
}

const TransferHistoryList = ({ limit = 10 }: TransferHistoryListProps) => {
  const [transfers, setTransfers] = useState<TransferHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branchNames, setBranchNames] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchBranchNames = async () => {
      try {
        const { data, error } = await supabase
          .from('cabang')
          .select('cabang_id, branch_name');
        
        if (error) throw error;
        
        const branchMap: Record<number, string> = {};
        data.forEach(branch => {
          branchMap[branch.cabang_id] = branch.branch_name;
        });
        
        setBranchNames(branchMap);
      } catch (err: any) {
        console.error('Error fetching branch names:', err);
      }
    };

    const fetchTransfers = async () => {
      setIsLoading(true);
      setError(null);
      
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
        
        // Fetch branches for this business
        const { data: branchData, error: branchError } = await supabase
          .from('cabang')
          .select('cabang_id')
          .eq('pelaku_usaha_id', businessData.pelaku_usaha_id);
          
        if (branchError) throw branchError;
        
        const branchIds = branchData.map(branch => branch.cabang_id);
        
        // Fetch transfers for these branches
        const { data, error } = await supabase
          .from('riwayat_transfer_stok')
          .select('*')
          .in('cabang_id_from', branchIds)
          .order('tanggal_transfer', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        
        setTransfers(data || []);
      } catch (err: any) {
        console.error('Error fetching transfers:', err);
        setError(err.message || 'Gagal memuat riwayat transfer');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranchNames();
    fetchTransfers();
  }, [limit]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <p>Memuat data riwayat transfer...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transfers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mb-4 text-gray-400" />
            <p>Belum ada riwayat transfer</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Transfer Stok Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Transfer</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Dari Cabang</TableHead>
              <TableHead>Ke Cabang</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((transfer) => (
              <TableRow key={transfer.id}>
                <TableCell className="font-medium">{transfer.nomor_transfer}</TableCell>
                <TableCell>{transfer.nama_produk}</TableCell>
                <TableCell>{transfer.jumlah_produk} {transfer.satuan}</TableCell>
                <TableCell>{branchNames[transfer.cabang_id_from] || '-'}</TableCell>
                <TableCell>{branchNames[transfer.cabang_id_to] || '-'}</TableCell>
                <TableCell>{formatDate(transfer.tanggal_transfer)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransferHistoryList;
