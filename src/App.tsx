
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { Toaster } from "./components/ui/toaster";
import { ToasterProvider } from "./components/ui/sonner";
import { AuthProvider } from "./hooks/auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import History from "./pages/History";
import Branches from "./pages/Branches";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Employee from "./pages/Employee";
import Packages from "./pages/Packages";
import Kas from "./pages/Kas";
import Attendance from "./pages/Attendance";
import HomeIndex from "./pages/Index";
import PrintPreview from "./pages/PrintPreview";
import OrderConfirmation from "./pages/OrderConfirmation";
import TransferStock from "./pages/TransferStock";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToasterProvider />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/print-preview" element={<PrintPreview />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomeIndex />} />
              <Route path="pos" element={<POS />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="history" element={<History />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="branches" element={<Branches />} />
              <Route path="customers" element={<Customers />} />
              <Route path="employee" element={<Employee />} />
              <Route path="packages" element={<Packages />} />
              <Route path="kas" element={<Kas />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="order-confirmation" element={<OrderConfirmation />} />
              <Route path="stock/transfer" element={<TransferStock />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
