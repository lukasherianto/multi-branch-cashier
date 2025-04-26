
import { useState } from "react";
import { UserDetails } from "./types";

interface UseUserDetailsReturn {
  userDetails: UserDetails | null;
  setUserDetails: (details: UserDetails | null) => void;
  pelakuUsaha: any;
  setPelakuUsaha: (data: any) => void;
  cabang: any;
  setCabang: (data: any) => void;
  cabangList: any[];
  setCabangList: (data: any[]) => void;
  selectedCabangId: number | null;
  setSelectedCabangId: (id: number | null) => void;
}

export const useUserDetails = (): UseUserDetailsReturn => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
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

