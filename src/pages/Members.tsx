
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MemberList from "@/components/members/MemberList";
import MemberForm from "@/components/members/MemberForm";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth";
import TransferHistoryList from "@/components/transfer/TransferHistoryList";

const Members = () => {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { pelakuUsaha } = useAuth();

  const handleMemberAdded = () => {
    toast({
      title: "Member berhasil ditambahkan",
      description: "Data member baru telah disimpan",
    });
    setShowForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  if (!pelakuUsaha) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              Silakan lengkapi profil usaha Anda terlebih dahulu
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daftar Member</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Member Baru
        </Button>
      </div>

      {showForm ? (
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <MemberForm 
            onCancel={() => setShowForm(false)}
            onSuccess={handleMemberAdded}
          />
        </div>
      ) : (
        <>
          <MemberList refreshTrigger={refreshTrigger} />
          <div className="mt-8">
            <TransferHistoryList limit={5} />
          </div>
        </>
      )}
    </div>
  );
};

export default Members;
