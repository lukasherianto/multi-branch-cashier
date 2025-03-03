
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./hooks/useAuth";

// Pages
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import POS from "./pages/POS";
import Products from "./pages/Products";
import ProductCategories from "./pages/ProductCategories";
import History from "./pages/History";
import Returns from "./pages/Returns";
import Reports from "./pages/Reports";
import Members from "./pages/Members";
import Kas from "./pages/Kas";
import KasPurchases from "./pages/KasPurchases";
import Branches from "./pages/Branches";
import Attendance from "./pages/Attendance";
import Settings from "./pages/Settings";
import OrderConfirmation from "./pages/OrderConfirmation";
import PrintPreview from "./pages/PrintPreview";
import StockTransfer from "./pages/StockTransfer";

// Layout and Auth components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserRole } from "./types/auth";

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Define role access for specific routes
const allRoles: UserRole[] = ['pelaku_usaha', 'admin', 'kasir', 'pelayan'];
const managerialRoles: UserRole[] = ['pelaku_usaha', 'admin'];
const cashierRoles: UserRole[] = ['pelaku_usaha', 'kasir'];
const attendanceRoles: UserRole[] = ['pelaku_usaha', 'admin', 'kasir', 'pelayan'];

function App() {
  // Add debugging for app initialization
  console.log('App component initializing');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Index />} />
                
                {/* POS routes - accessible to Pelaku Usaha and Kasir */}
                <Route path="/pos" element={
                  <ProtectedRoute allowedRoles={cashierRoles}>
                    <POS />
                  </ProtectedRoute>
                } />
                
                {/* Products routes - accessible to Pelaku Usaha and Admin */}
                <Route path="/products" element={
                  <ProtectedRoute allowedRoles={managerialRoles}>
                    <Products />
                  </ProtectedRoute>
                } />
                <Route path="/products/categories" element={
                  <ProtectedRoute allowedRoles={managerialRoles}>
                    <ProductCategories />
                  </ProtectedRoute>
                } />
                
                {/* Transaction routes - accessible to Pelaku Usaha, Admin, Kasir */}
                <Route path="/history" element={
                  <ProtectedRoute allowedRoles={[...managerialRoles, 'kasir']}>
                    <History />
                  </ProtectedRoute>
                } />
                <Route path="/returns" element={
                  <ProtectedRoute allowedRoles={[...managerialRoles, 'kasir']}>
                    <Returns />
                  </ProtectedRoute>
                } />
                
                {/* Financial routes - accessible to Pelaku Usaha and Admin */}
                <Route path="/reports" element={
                  <ProtectedRoute allowedRoles={managerialRoles}>
                    <Reports />
                  </ProtectedRoute>
                } />
                <Route path="/kas" element={
                  <ProtectedRoute allowedRoles={managerialRoles}>
                    <Kas />
                  </ProtectedRoute>
                } />
                <Route path="/kas/purchases" element={
                  <ProtectedRoute allowedRoles={managerialRoles}>
                    <KasPurchases />
                  </ProtectedRoute>
                } />
                
                {/* Branch and Member routes - accessible to Pelaku Usaha and Admin */}
                <Route path="/branches" element={
                  <ProtectedRoute allowedRoles={managerialRoles}>
                    <Branches />
                  </ProtectedRoute>
                } />
                <Route path="/members" element={
                  <ProtectedRoute allowedRoles={managerialRoles}>
                    <Members />
                  </ProtectedRoute>
                } />
                
                {/* Attendance - accessible to all roles */}
                <Route path="/attendance" element={
                  <ProtectedRoute allowedRoles={attendanceRoles}>
                    <Attendance />
                  </ProtectedRoute>
                } />
                
                {/* Settings - accessible to Pelaku Usaha and Admin */}
                <Route path="/settings" element={
                  <ProtectedRoute allowedRoles={managerialRoles}>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                {/* Order and Print routes - accessible to Pelaku Usaha and Kasir */}
                <Route path="/order-confirmation" element={
                  <ProtectedRoute allowedRoles={cashierRoles}>
                    <OrderConfirmation />
                  </ProtectedRoute>
                } />
                <Route path="/print-preview" element={
                  <ProtectedRoute allowedRoles={cashierRoles}>
                    <PrintPreview />
                  </ProtectedRoute>
                } />
                
                {/* Stock Transfer - accessible to Pelaku Usaha and Admin */}
                <Route path="/stock-transfer" element={
                  <ProtectedRoute allowedRoles={managerialRoles}>
                    <StockTransfer />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </BrowserRouter>
          {import.meta.env.DEV && <ReactQueryDevtools />}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
