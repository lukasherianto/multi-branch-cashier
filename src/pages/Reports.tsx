import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartBar,
  Database,
  Users,
  DollarSign,
  User,
  Percent,
  ArrowReturnLeft,
} from "lucide-react";
import SalesReport from "@/components/reports/SalesReport";
import InventoryReport from "@/components/reports/InventoryReport";
import CustomerReport from "@/components/reports/CustomerReport";
import FinancialReport from "@/components/reports/FinancialReport";
import EmployeeReport from "@/components/reports/EmployeeReport";
import DiscountReport from "@/components/reports/DiscountReport";
import ReturnReport from "@/components/reports/ReturnReport";

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Laporan</h2>
        <p className="text-gray-600 mt-2">Analisis komprehensif bisnis Anda</p>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <TabsTrigger value="sales" className="space-x-2">
            <ChartBar className="w-4 h-4" />
            <span>Penjualan</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="space-x-2">
            <Database className="w-4 h-4" />
            <span>Inventaris</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="space-x-2">
            <Users className="w-4 h-4" />
            <span>Pelanggan</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Keuangan</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="space-x-2">
            <User className="w-4 h-4" />
            <span>Karyawan</span>
          </TabsTrigger>
          <TabsTrigger value="discounts" className="space-x-2">
            <Percent className="w-4 h-4" />
            <span>Diskon</span>
          </TabsTrigger>
          <TabsTrigger value="returns" className="space-x-2">
            <ArrowReturnLeft className="w-4 h-4" />
            <span>Retur</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="sales">
            <SalesReport />
          </TabsContent>
          <TabsContent value="inventory">
            <InventoryReport />
          </TabsContent>
          <TabsContent value="customers">
            <CustomerReport />
          </TabsContent>
          <TabsContent value="financial">
            <FinancialReport />
          </TabsContent>
          <TabsContent value="employees">
            <EmployeeReport />
          </TabsContent>
          <TabsContent value="discounts">
            <DiscountReport />
          </TabsContent>
          <TabsContent value="returns">
            <ReturnReport />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Reports;