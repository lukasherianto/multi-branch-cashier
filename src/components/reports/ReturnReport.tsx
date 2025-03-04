
import ReturnHistoryTable from "./returns/ReturnHistoryTable";
import ReturnStats from "./returns/ReturnStats";
import ReturnEmptyState from "./returns/ReturnEmptyState";
import { useReturnReport } from "@/hooks/reports/useReturnReport";

const ReturnReport = () => {
  const { returns, totalReturns, totalReturnedItems, pelakuUsaha } = useReturnReport();

  if (!pelakuUsaha) {
    return <ReturnEmptyState />;
  }

  return (
    <div className="space-y-6">
      <ReturnStats 
        totalReturns={totalReturns}
        totalReturnedItems={totalReturnedItems}
      />
      <ReturnHistoryTable returns={returns || []} />
    </div>
  );
};

export default ReturnReport;
