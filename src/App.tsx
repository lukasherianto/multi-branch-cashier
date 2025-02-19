
import { RouterProvider, createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import POS from "@/pages/POS";
import Products from "@/pages/Products";
import Purchase from "@/pages/Purchase";
import History from "@/pages/History";
import Returns from "@/pages/Returns";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Kas from "@/pages/Kas";
import Supplier from "@/pages/Supplier";
import Branches from "@/pages/Branches";
import Attendance from "@/pages/Attendance";
import { PurchaseForm } from "@/components/pos/forms/PurchaseForm";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

// Definisikan routes di luar komponen App
const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout>
          <Outlet />
        </Layout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Index /> },
      { path: "pos", element: <POS /> },
      { path: "products", element: <Products /> },
      { path: "purchase", element: <Purchase /> },
      { path: "purchase/add", element: <PurchaseForm /> },
      { path: "history", element: <History /> },
      { path: "returns", element: <Returns /> },
      { path: "reports", element: <Reports /> },
      { path: "settings", element: <Settings /> },
      { path: "kas", element: <Kas /> },
      { path: "supplier", element: <Supplier /> },
      { path: "branches", element: <Branches /> },
      { path: "attendance", element: <Attendance /> },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
  },
];

const router = createBrowserRouter(routes);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
