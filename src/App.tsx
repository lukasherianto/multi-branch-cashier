
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import POS from "@/pages/POS";
import Products from "@/pages/Products";
import ProductCategories from "@/pages/ProductCategories";
import StockTransfer from "@/pages/StockTransfer";
import History from "@/pages/History";
import Returns from "@/pages/Returns";
import Reports from "@/pages/Reports";
import Branches from "@/pages/Branches";
import Settings from "@/pages/Settings";
import PrintPreview from "@/pages/PrintPreview";
import Kas from "@/pages/Kas";
import KasPurchases from "@/pages/KasPurchases";
import Attendance from "@/pages/Attendance";
import Members from "@/pages/Members";
import OrderConfirmation from "@/pages/OrderConfirmation";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { useEffect } from "react";

function AppRoutes() {
  const { isLoading, user } = useAuth();
  
  useEffect(() => {
    document.title = "Xaviera POS";
    console.log("App routes mounted, authenticated:", !!user);
  }, [user]);

  if (isLoading) {
    console.log("Auth loading...");
    return <div className="p-4">Loading authentication...</div>;
  }

  if (!user) {
    console.log("No user, redirecting to auth");
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  console.log("Rendering authenticated routes");
  
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="pos" element={<POS />} />
        <Route path="products" element={<Products />} />
        <Route path="products/categories" element={<ProductCategories />} />
        <Route path="products/transfer" element={<StockTransfer />} />
        <Route path="history" element={<History />} />
        <Route path="returns" element={<Returns />} />
        <Route path="reports" element={<Reports />} />
        <Route path="members" element={<Members />} />
        <Route path="kas" element={<Kas />} />
        <Route path="kas/purchases" element={<KasPurchases />} />
        <Route path="branches" element={<Branches />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="settings" element={<Settings />} />
        <Route path="print-preview" element={<PrintPreview />} />
        <Route path="order-confirmation" element={<OrderConfirmation />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  console.log("App component rendering");
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
