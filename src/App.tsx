import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Branches from "./pages/Branches";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import PrintPreview from "./pages/PrintPreview";
import History from "./pages/History";

// Create a client with configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <Layout>
                <Index />
              </Layout>
            }
          />
          <Route
            path="/branches"
            element={
              <Layout>
                <Branches />
              </Layout>
            }
          />
          <Route
            path="/products"
            element={
              <Layout>
                <Products />
              </Layout>
            }
          />
          <Route
            path="/pos"
            element={
              <Layout>
                <POS />
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />
          <Route path="/print-preview" element={<PrintPreview />} />
          <Route
            path="/history"
            element={
              <Layout>
                <History />
              </Layout>
            }
          />
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;