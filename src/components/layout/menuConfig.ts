
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
} from 'lucide-react';

const menuConfig = [
  {
    title: 'Dashboard',
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
