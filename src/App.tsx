
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import Settings from "@/pages/Settings";
import POS from "@/pages/POS";
import Index from "@/pages/Index";
import Categories from "@/pages/Categories";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Reports from "@/pages/Reports";
import History from "@/pages/History";
import Returns from "@/pages/Returns";
import Products from "@/pages/Products";
import Members from "@/pages/Members";
import ProductCategories from "@/pages/ProductCategories";
import Kas from "@/pages/Kas";
import KasPurchases from "@/pages/KasPurchases";
import Packages from "@/pages/Packages";
import OrderConfirmation from "@/pages/OrderConfirmation";
import PrintPreview from "@/pages/PrintPreview";
import TransferStock from "@/pages/TransferStock";
import TransferToBranch from "@/pages/TransferToBranch";
import StockTransfer from "@/pages/StockTransfer";
import Branches from "@/pages/Branches";
import Attendance from "@/pages/Attendance";
import Customers from "@/pages/Customers";
import Employee from "@/pages/Employee";
import CashierDashboard from "@/pages/CashierDashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster as SonnerToaster } from "sonner";
import { AuthProvider } from "@/hooks/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/cashier-dashboard" element={<CashierDashboard />} />
            <Route path="/employee" element={<Employee />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos"
              element={
                <ProtectedRoute>
                  <POS />
                </ProtectedRoute>
              }
            />
            <Route
              path="/branches"
              element={
                <ProtectedRoute>
                  <Branches />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/returns"
              element={
                <ProtectedRoute>
                  <Returns />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/categories"
              element={
                <ProtectedRoute>
                  <ProductCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kas"
              element={
                <ProtectedRoute>
                  <Kas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kas/purchases"
              element={
                <ProtectedRoute>
                  <KasPurchases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/packages"
              element={
                <ProtectedRoute>
                  <Packages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-confirmation"
              element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/print-preview"
              element={
                <ProtectedRoute>
                  <PrintPreview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route path="/stock-transfer" element={<StockTransfer />}>
              <Route path="" element={<Navigate to="transfer" replace />} />
              <Route path="transfer" element={<TransferStock />} />
              <Route path="to-branch" element={<TransferToBranch />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
