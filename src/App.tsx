import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Branches from "./pages/Branches";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import PrintPreview from "./pages/PrintPreview";

// Create a client
const queryClient = new QueryClient();

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
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;