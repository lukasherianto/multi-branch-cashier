import { Button } from "@/components/ui/button";
import { Loader2, GitBranchPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BranchFormFields } from "./branch/BranchFormFields";
import { useBranchForm } from "./branch/useBranchForm";

export const BranchForm = () => {
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