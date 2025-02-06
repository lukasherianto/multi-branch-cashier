import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import { Outlet } from "react-router-dom";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import POS from "@/pages/POS";
import Settings from "@/pages/Settings";
import Products from "@/pages/Products";
import Purchase from "@/pages/Purchase";
import History from "@/pages/History";
import Returns from "@/pages/Returns";
import Supplier from "@/pages/Supplier";
import Reports from "@/pages/Reports";
import Attendance from "@/pages/Attendance";
import Kas from "@/pages/Kas";
import Branches from "@/pages/Branches";

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
        path: "pos",
        element: <POS />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "purchase",
        element: <Purchase />,
      },
      {
        path: "history",
        element: <History />,
      },
      {
        path: "returns",
        element: <Returns />,
      },
      {
        path: "supplier",
        element: <Supplier />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "attendance",
        element: <Attendance />,
      },
      {
        path: "kas",
        element: <Kas />,
      },
      {
        path: "branches",
        element: <Branches />,
      },
    ],
  },
  {
    path: "auth",
    element: <Auth />,
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;