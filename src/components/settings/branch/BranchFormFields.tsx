
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WhatsAppInput } from "../WhatsAppInput";

interface BranchFormFieldsProps {
  branchName: string;
  setBranchName: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  whatsapp: string;
  setWhatsapp: (value: string) => void;
}

export const BranchFormFields = ({
  branchName,
  setBranchName,
  address,
  setAddress,
  whatsapp,
  setWhatsapp,
}: BranchFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="branchName">Nama Cabang</Label>
        <Input
          id="branchName"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          placeholder="Masukkan nama cabang"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Alamat</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Masukkan alamat cabang"
        />
      </div>
      <WhatsAppInput 
        value={whatsapp}
        onChange={setWhatsapp}
      />
    </>
  );
};
