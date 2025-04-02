
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
  Warehouse,
  ChefHat,
} from 'lucide-react';

const menuConfig = [
  {
    title: 'Dasbor',
    items: [
      {
        title: 'Ringkasan',
        icon: LayoutDashboard,
        path: '/',
        code: 'dashboard'
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
        code: 'products'
      },
      {
        title: 'Kategori Produk',
        icon: FolderOpen,
        path: '/products/categories',
        code: 'products_categories'
      },
      {
        title: 'Transfer Stok',
        icon: Package,
        path: '/stock-transfer',
        code: 'stock_transfer'
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
        code: 'pos'
      },
      {
        title: 'Riwayat Transaksi',
        icon: ListChecks,
        path: '/history',
        code: 'history'
      },
      {
        title: 'Retur',
        icon: ArrowLeftRight,
        path: '/returns',
        code: 'returns'
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
        code: 'kas'
      },
      {
        title: 'Pembelian',
        icon: Wallet,
        path: '/kas/purchases',
        code: 'purchases'
      },
      {
        title: 'Laporan',
        icon: FileText,
        path: '/reports',
        code: 'reports'
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
        code: 'branches'
      },
      {
        title: 'Karyawan',
        icon: Users,
        path: '/employee',
        code: 'employee'
      },
      {
        title: 'Absensi',
        icon: CalendarDays,
        path: '/attendance',
        code: 'attendance'
      },
      {
        title: 'Data Member',
        icon: Users,
        path: '/members',
        code: 'members'
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
        code: 'settings'
      },
    ],
  },
];

export default menuConfig;
