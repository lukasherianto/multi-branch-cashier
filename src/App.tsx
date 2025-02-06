import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Outlet /></Layout>,
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/auth",
        element: <Auth />,
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
        path: "/history",
        element: <History />,
      },
      {
        path: "/returns",
        element: <Returns />,
      },
      {
        path: "/reports",
        element: <Reports />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/kas",
        element: <Kas />,
      },
      {
        path: "/supplier",
        element: <Supplier />,
      },
      {
        path: "/branches",
        element: <Branches />,
      },
      {
        path: "/attendance",
        element: <Attendance />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
