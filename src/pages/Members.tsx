
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MemberList from "@/components/members/MemberList";
import MemberForm from "@/components/members/MemberForm";
import { useToast } from "@/hooks/use-toast";

const Members = () => {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMemberAdded = () => {
    toast({
      title: "Member berhasil ditambahkan",
      description: "Data member baru telah disimpan",
    });
    setShowForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

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
        <MemberList refreshTrigger={refreshTrigger} />
      )}
    </div>
  );
};

export default Members;
