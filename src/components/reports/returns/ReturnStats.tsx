
import StatCard from "../shared/StatCard";

interface ReturnStatsProps {
  totalReturns: number;
  totalReturnedItems: number;
}

const ReturnStats = ({ totalReturns, totalReturnedItems }: ReturnStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatCard
        title="Total Retur"
        value={totalReturns}
      />
      <StatCard
        title="Total Barang Diretur"
        value={totalReturnedItems}
      />
    </div>
  );
};

export default ReturnStats;
