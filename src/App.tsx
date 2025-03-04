import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./hooks/auth";

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

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

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
                <Route path="/pos" element={<ProtectedRoute><POS /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/products/categories" element={<ProtectedRoute><ProductCategories /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/kas" element={<ProtectedRoute><Kas /></ProtectedRoute>} />
                <Route path="/kas/purchases" element={<ProtectedRoute><KasPurchases /></ProtectedRoute>} />
                <Route path="/branches" element={<ProtectedRoute><Branches /></ProtectedRoute>} />
                <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
                <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                <Route path="/print-preview" element={<ProtectedRoute><PrintPreview /></ProtectedRoute>} />
                <Route path="/stock-transfer" element={<ProtectedRoute><StockTransfer /></ProtectedRoute>} />
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
