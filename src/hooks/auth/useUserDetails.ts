
import { useState } from "react";

export const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [pelakuUsaha, setPelakuUsaha] = useState<any>(null);
  const [cabang, setCabang] = useState<any>(null);
  const [cabangList, setCabangList] = useState<any[]>([]);
  const [selectedCabangId, setSelectedCabangId] = useState<number | null>(null);

  return {
    userDetails,
    setUserDetails,
    pelakuUsaha,
    setPelakuUsaha,
    cabang,
    setCabang,
    cabangList,
    setCabangList,
    selectedCabangId,
    setSelectedCabangId,
  };
};
