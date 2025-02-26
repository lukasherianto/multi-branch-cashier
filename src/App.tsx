
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import POS from "./pages/POS";
import Products from "./pages/Products";
import ProductCategories from "./pages/ProductCategories";
import Settings from "./pages/Settings";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Returns from "./pages/Returns";
import Kas from "./pages/Kas";
import Branches from "./pages/Branches";
import Attendance from "./pages/Attendance";
import PrintPreview from "./pages/PrintPreview";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/print-preview" element={<PrintPreview />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="pos" element={<POS />} />
            <Route path="products" element={<Products />} />
            <Route path="products/categories" element={<ProductCategories />} />
            <Route path="history" element={<History />} />
            <Route path="returns" element={<Returns />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="kas" element={<Kas />} />
            <Route path="branches" element={<Branches />} />
            <Route path="attendance" element={<Attendance />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
