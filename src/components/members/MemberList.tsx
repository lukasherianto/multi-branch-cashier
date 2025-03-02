
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Member {
  pelanggan_id: number;
  nama: string;
  whatsapp: string;
  member_type: "member1" | "member2" | "none";
  created_at: string;
}

interface MemberListProps {
  refreshTrigger?: number;
}

const MemberList = ({ refreshTrigger = 0 }: MemberListProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
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
        
        // Fetch members
        const { data, error } = await supabase
          .from('pelanggan')
          .select('*')
          .eq('pelaku_usaha_id', businessData.pelaku_usaha_id)
          .in('member_type', ['member1', 'member2'])
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setMembers(data || []);
      } catch (err: any) {
        console.error('Error fetching members:', err);
        setError(err.message || 'Gagal memuat daftar member');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [refreshTrigger]);

  const getMemberTypeBadge = (type: string) => {
    switch(type) {
      case 'member1':
        return <Badge variant="default">Member 1</Badge>;
      case 'member2':
        return <Badge variant="secondary">Member 2</Badge>;
      default:
        return <Badge variant="outline">Non-Member</Badge>;
    }
  };

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
            <p>Memuat data member...</p>
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

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <p>Belum ada data member</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Tipe Member</TableHead>
              <TableHead>Tanggal Pendaftaran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member, index) => (
              <TableRow key={member.pelanggan_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{member.nama}</TableCell>
                <TableCell>{member.whatsapp}</TableCell>
                <TableCell>{getMemberTypeBadge(member.member_type)}</TableCell>
                <TableCell>{formatDate(member.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MemberList;
