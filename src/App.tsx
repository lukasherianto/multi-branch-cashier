import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Pages
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import POS from "./pages/POS";
import Products from "./pages/Products";
import ProductCategories from "./pages/ProductCategories";
import History from "./pages/History";
import Returns from "./pages/Returns";
import StockTransfer from "./pages/StockTransfer";
import TransferToBranch from "./pages/TransferToBranch";
import Reports from "./pages/Reports";
import Members from "./pages/Members";
import Kas from "./pages/Kas";
import KasPurchases from "./pages/KasPurchases";
import Branches from "./pages/Branches";
import Attendance from "./pages/Attendance";
import Settings from "./pages/Settings";
import OrderConfirmation from "./pages/OrderConfirmation";
import PrintPreview from "./pages/PrintPreview";

// Layout and Auth components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { supabase } from "./integrations/supabase/client";

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Index />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/categories" element={<ProductCategories />} />
              <Route path="/products/transfer" element={<StockTransfer />} />
              <Route path="/products/transfer-to-branch" element={<TransferToBranch />} />
              <Route path="/history" element={<History />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/members" element={<Members />} />
              <Route path="/kas" element={<Kas />} />
              <Route path="/kas/purchases" element={<KasPurchases />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/print-preview" element={<PrintPreview />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

export default App;
