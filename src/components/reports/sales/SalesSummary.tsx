
import React from 'react';
import StatCard from "../shared/StatCard";

interface SalesSummaryProps {
  totalTransactions: number;
  totalRevenue: number;
  totalProfit: number;
  profitMarginPercentage: string;
}

const SalesSummary: React.FC<SalesSummaryProps> = ({
  totalTransactions,
  totalRevenue,
  totalProfit,
  profitMarginPercentage
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Transaksi"
        value={totalTransactions}
      />
      <StatCard
        title="Total Pendapatan"
        value={`Rp ${totalRevenue.toLocaleString("id-ID")}`}
      />
      <StatCard
        title="Total Keuntungan"
        value={`Rp ${totalProfit.toLocaleString("id-ID")}`}
      />
      <StatCard
        title="Margin Keuntungan"
        value={`${profitMarginPercentage}%`}
      />
    </div>
  );
};

export default SalesSummary;
