import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartBar,
  Database,
  Users,
  DollarSign,
  User,
  Percent,
  RotateCcw,
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
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Laporan</h2>
        <p className="text-gray-600 mt-2">Analisis komprehensif bisnis Anda</p>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <Card className="p-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            <TabsTrigger value="sales" className="w-full">
              <div className="flex items-center space-x-2">
                <ChartBar className="w-4 h-4" />
                <span>Penjualan</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="w-full">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Inventaris</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="customers" className="w-full">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Pelanggan</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="financial" className="w-full">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Keuangan</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="employees" className="w-full">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Karyawan</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="discounts" className="w-full">
              <div className="flex items-center space-x-2">
                <Percent className="w-4 h-4" />
                <span>Diskon</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="returns" className="w-full">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4" />
                <span>Retur</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </Card>

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