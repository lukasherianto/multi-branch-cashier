
import { useEffect } from "react";

export const useBranchSelection = (
  selectedCabangId: number | null,
  cabangList: any[],
  setCabang: (data: any) => void
) => {
  useEffect(() => {
    if (selectedCabangId && cabangList.length > 0) {
      const selected = cabangList.find(c => c.cabang_id === selectedCabangId);
      setCabang(selected);
    }
  }, [selectedCabangId, cabangList, setCabang]);
};
