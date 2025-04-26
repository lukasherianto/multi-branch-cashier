
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

// Define base menu items
const dashboardMenu = {
  title: 'Dasbor',
  items: [
    {
      title: 'Ringkasan',
      icon: LayoutDashboard,
      path: '/',
    },
  ],
};

const productsMenu = {
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
};

const posMenu = {
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
};

const financeMenu = {
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
};

const managementMenu = {
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
};

const settingsMenu = {
  title: 'Lainnya',
  items: [
    {
      title: 'Pengaturan',
      icon: Settings,
      path: '/settings',
    },
  ],
};

const cashierDashboardMenu = {
  title: 'Dasbor Kasir',
  items: [
    {
      title: 'Ringkasan Kasir',
      icon: LayoutDashboard,
      path: '/kasir',
    },
  ],
};

// Menu configuration based on role
const menuConfigByRole = {
  // Full access for admin and business owner
  pelaku_usaha: [dashboardMenu, productsMenu, posMenu, financeMenu, managementMenu, settingsMenu],
  admin: [dashboardMenu, productsMenu, posMenu, financeMenu, managementMenu, settingsMenu],
  
  // Cashier gets limited access
  kasir: [
    cashierDashboardMenu,
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
      title: 'Karyawan',
      items: [
        {
          title: 'Absensi',
          icon: CalendarDays,
          path: '/attendance',
        },
      ],
    },
  ],
  
  // Default menu for anyone else
  default: [dashboardMenu],
};

// Default menu for backward compatibility
const menuConfig = [dashboardMenu, productsMenu, posMenu, financeMenu, managementMenu, settingsMenu];

export { menuConfigByRole };
export default menuConfig;
