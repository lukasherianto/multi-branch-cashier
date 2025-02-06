import { Routes, Route } from "react-router-dom";
import Purchase from "./pages/Purchase";
import { PurchaseForm } from "./components/pos/forms/PurchaseForm";

function App() {
  return (
    <Routes>
      <Route path="/purchase" element={<Purchase />} />
      <Route path="/purchase/add" element={<PurchaseForm />} />
    </Routes>
  );
}

export default App;
