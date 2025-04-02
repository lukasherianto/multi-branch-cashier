
import {
  LayoutDashboard,
  ListChecks,
  FolderOpen,
  ArrowLeftRight,
  Users,
  CalendarDays,
  Scale,
  Wallet,
  FileText,
  Settings,
  Package,
  UserRound,
} from 'lucide-react';

const menuConfig = [
  {
    title: 'Dasbor',
    items: [
      {
        title: 'Ringkasan',
        icon: LayoutDashboard,
        path: '/',
      },
    ],
  },
  {
    title: 'Produk',
    items: [
      {
        title: 'Daftar Produk',
        icon: ListChecks,
        path: '/products',
      },
      {
        title: 'Kategori Produk',
        icon: FolderOpen,
        path: '/products/categories',
      },
      {
        title: 'Transfer Stok',
        icon: Package,
        path: '/stock-transfer',
      },
    ],
  },
  {
    title: 'Kasir',
    items: [
      {
        title: 'POS',
        icon: Scale,
        path: '/pos',
      },
      {
        title: 'Riwayat Transaksi',
        icon: ListChecks,
        path: '/history',
      },
      {
        title: 'Retur',
        icon: ArrowLeftRight,
        path: '/returns',
      },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      {
        title: 'Kas',
        icon: Wallet,
        path: '/kas',
      },
      {
        title: 'Pembelian',
        icon: Wallet,
        path: '/kas/purchases',
      },
      {
        title: 'Laporan',
        icon: FileText,
        path: '/reports',
      },
    ],
  },
  {
    title: 'Manajemen',
    items: [
      {
        title: 'Cabang',
        icon: LayoutDashboard,
        path: '/branches',
      },
      {
        title: 'Karyawan',
        icon: UserRound,
        path: '/employee',
      },
      {
        title: 'Absensi',
        icon: CalendarDays,
        path: '/attendance',
      },
      {
        title: 'Data Member',
        icon: Users,
        path: '/members',
      },
    ],
  },
  {
    title: 'Lainnya',
    items: [
      {
        title: 'Pengaturan',
        icon: Settings,
        path: '/settings',
      },
    ],
  },
];

export default menuConfig;
