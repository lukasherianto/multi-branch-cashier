import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import POS from "@/pages/POS";
import Settings from "@/pages/Settings";
import Branches from "@/pages/Branches";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/branches" element={<Branches />} />
        </Routes>
      </Layout>
      <Toaster />
    </Router>
  );
}

export default App;