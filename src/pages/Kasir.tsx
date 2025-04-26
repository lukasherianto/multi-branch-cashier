
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

const Kasir = () => {
  const { userRole } = useAuth();
  
  // Only allow users with role 'kasir' to access this page
  if (userRole !== 'kasir' && userRole !== 'admin' && userRole !== 'pelaku_usaha') {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard Kasir</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Akses Cepat</h2>
          <div className="space-y-4">
            <a href="/pos" className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-md transition">
              <span className="font-medium">POS</span>
              <p className="text-sm text-gray-500">Transaksi penjualan</p>
            </a>
            <a href="/history" className="block p-4 bg-green-50 hover:bg-green-100 rounded-md transition">
              <span className="font-medium">Riwayat Transaksi</span>
              <p className="text-sm text-gray-500">Riwayat penjualan</p>
            </a>
            <a href="/returns" className="block p-4 bg-amber-50 hover:bg-amber-100 rounded-md transition">
              <span className="font-medium">Retur</span>
              <p className="text-sm text-gray-500">Pengembalian barang</p>
            </a>
            <a href="/attendance" className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-md transition">
              <span className="font-medium">Absensi</span>
              <p className="text-sm text-gray-500">Catat kehadiran</p>
            </a>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Kasir</h2>
          <div className="space-y-2">
            <p>Selamat datang di Panel Kasir</p>
            <p className="text-sm text-gray-500">
              Akses terbatas untuk mengelola transaksi penjualan, 
              melihat riwayat transaksi, mengelola retur, dan mencatat absensi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kasir;
