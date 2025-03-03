import {
  LayoutDashboard,
  ListChecks,
  FolderOpen,
  ArrowLeftRight,
  Users,
  CalendarDays,
  Scale,
  Wallet,
  FileBarGraph,
  Settings,
  MoveRight,
} from 'lucide-react';

const menuConfig = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Ringkasan',
        icon: <LayoutDashboard size={18} />,
        path: '/',
      },
    ],
  },
  {
    title: 'Produk',
    items: [
      {
        title: 'Daftar Produk',
        icon: <ListChecks size={18} />,
        path: '/products',
      },
      {
        title: 'Kategori Produk',
        icon: <FolderOpen size={18} />,
        path: '/products/categories',
      },
      {
        title: 'Transfer Stok',
        icon: <ArrowLeftRight size={18} />,
        path: '/products/transfer',
      },
      {
        title: 'Transfer ke Cabang',
        icon: <MoveRight size={18} />,
        path: '/products/transfer-to-branch',
      },
    ],
  },
  {
    title: 'Kasir',
    items: [
      {
        title: 'POS',
        icon: <Scale size={18} />,
        path: '/pos',
      },
      {
        title: 'Riwayat Transaksi',
        icon: <ListChecks size={18} />,
        path: '/history',
      },
      {
        title: 'Retur',
        icon: <ArrowLeftRight size={18} />,
        path: '/returns',
      },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      {
        title: 'Kas',
        icon: <Wallet size={18} />,
        path: '/kas',
      },
      {
        title: 'Pembelian',
        icon: <Wallet size={18} />,
        path: '/kas/purchases',
      },
      {
        title: 'Laporan',
        icon: <FileBarGraph size={18} />,
        path: '/reports',
      },
    ],
  },
  {
    title: 'Manajemen',
    items: [
      {
        title: 'Cabang',
        icon: <LayoutDashboard size={18} />,
        path: '/branches',
      },
      {
        title: 'Absensi',
        icon: <CalendarDays size={18} />,
        path: '/attendance',
      },
      {
        title: 'Data Member',
        icon: <Users size={18} />,
        path: '/members',
      },
    ],
  },
  {
    title: 'Lainnya',
    items: [
      {
        title: 'Pengaturan',
        icon: <Settings size={18} />,
        path: '/settings',
      },
    ],
  },
];

export default menuConfig;
