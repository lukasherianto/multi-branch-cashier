import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import POS from "./pages/POS";
import Products from "./pages/Products";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Branches from "./pages/Branches";
import PrintPreview from "./pages/PrintPreview";
import Attendance from "./pages/Attendance";
import Kas from "./pages/Kas";
import Supplier from "./pages/Supplier";
import Purchase from "./pages/Purchase";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/print-preview" element={<PrintPreview />} />
        <Route
          path="/"
          element={
            <Layout>
              <Index />
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
          path="/products"
          element={
            <Layout>
              <Products />
            </Layout>
          }
        />
        <Route
          path="/history"
          element={
            <Layout>
              <History />
            </Layout>
          }
        />
        <Route
          path="/reports"
          element={
            <Layout>
              <Reports />
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
        <Route
          path="/branches"
          element={
            <Layout>
              <Branches />
            </Layout>
          }
        />
        <Route
          path="/attendance"
          element={
            <Layout>
              <Attendance />
            </Layout>
          }
        />
        <Route
          path="/kas"
          element={
            <Layout>
              <Kas />
            </Layout>
          }
        />
        <Route
          path="/supplier"
          element={
            <Layout>
              <Supplier />
            </Layout>
          }
        />
        <Route
          path="/purchase"
          element={
            <Layout>
              <Purchase />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;