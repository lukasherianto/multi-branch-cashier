import { Button } from "@/components/ui/button";
import { Loader2, GitBranchPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BranchFormFields } from "./branch/BranchFormFields";
import { useBranchForm } from "./branch/useBranchForm";
import { useAuth } from "@/hooks/auth";

export const BranchForm = () => {
  const { pelakuUsaha } = useAuth();
  const {
    branchName,
    setBranchName,
    address,
    setAddress,
    whatsapp,
    setWhatsapp,
    isSaving,
    handleSubmit,
  } = useBranchForm();

  // Menampilkan pesan jika pelaku usaha belum terdaftar
  if (!pelakuUsaha) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="p-4 text-center">
            <p className="text-red-500 font-medium">
              Silakan lengkapi data usaha terlebih dahulu sebelum menambahkan cabang.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <BranchFormFields
            branchName={branchName}
            setBranchName={setBranchName}
            address={address}
            setAddress={setAddress}
            whatsapp={whatsapp}
            setWhatsapp={setWhatsapp}
          />
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <GitBranchPlus className="mr-2 h-4 w-4" />
                Tambah Cabang
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
