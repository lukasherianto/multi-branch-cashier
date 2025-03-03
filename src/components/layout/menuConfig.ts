
import { LayoutDashboard, Store, Package2, History, FileBarChart2, Settings, ArrowLeftRight, Banknote, Building2, UserRound, Users, ArrowDownUp } from "lucide-react";

export const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/pos", label: "POS", icon: Store },
  { 
    path: "/products",
    label: "Produk",
    icon: Package2,
    subItems: [
      { path: "/products", label: "Daftar Produk" },
      { path: "/products/categories", label: "Kategori" },
      { path: "/products/transfer", label: "Transfer Produk" },
      { path: "/products/transfer-to-branch", label: "Transfer Ke Cabang" }
    ]
  },
  { path: "/history", label: "Riwayat", icon: History },
  { path: "/returns", label: "Retur", icon: ArrowLeftRight },
  { path: "/reports", label: "Laporan", icon: FileBarChart2 },
  { path: "/members", label: "Member", icon: Users },
  { 
    path: "/kas",
    label: "Kas",
    icon: Banknote,
    subItems: [
      { path: "/kas", label: "Kas Masuk/Keluar" },
      { path: "/kas/purchases", label: "Pembelian" }
    ]
  },
  { path: "/branches", label: "Cabang", icon: Building2 },
  { path: "/attendance", label: "Absensi", icon: UserRound },
  { path: "/settings", label: "Pengaturan", icon: Settings },
];

// Define hidden routes that don't appear in the menu
export const hiddenRoutes = [
  { path: "/order-confirmation", label: "Konfirmasi Pesanan" },
  { path: "/print-preview", label: "Print Preview" }
];
