import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Outlet } from "react-router-dom";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import POS from "@/pages/POS";
import Products from "@/pages/Products";
import Purchase from "@/pages/Purchase";
import { PurchaseForm } from "@/components/pos/forms/PurchaseForm";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/pos",
        element: <POS />,
      },
      {
        path: "/products",
        element: <Products />,
      },
      {
        path: "/purchase",
        element: <Purchase />,
      },
      {
        path: "/purchase/add",
        element: <PurchaseForm />,
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}

export default App;