import { Routes, Route, Outlet } from "react-router-dom";
import Purchase from "./pages/Purchase";
import { PurchaseForm } from "./components/pos/forms/PurchaseForm";
import Dashboard from "./pages/Index";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route element={<Layout><Outlet /></Layout>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/purchase/add" element={<PurchaseForm />} />
      </Route>
    </Routes>
  );
}

export default App;