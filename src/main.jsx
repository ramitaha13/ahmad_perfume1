import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./components/home.jsx";
import Addnewperfume from "./components/addnewperfume.jsx";
import Login from "./components/login.jsx";
import Addnewuser from "./components/addnewuser.jsx";
import Adminpage from "./components/adminpage.jsx";
import ManagePerfumes from "./components/managePerfumes.jsx";
import Checkout from "./components/checkout.jsx";
import Orders from "./components/orders.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "*",
    element: <Home />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/addnewperfume",
    element: (
      <ProtectedRoute>
        <Addnewperfume />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/addnewuser",
    element: (
      <ProtectedRoute>
        <Addnewuser />
      </ProtectedRoute>
    ),
  },
  {
    path: "/adminpage",
    element: (
      <ProtectedRoute>
        <Adminpage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/managePerfumes",
    element: (
      <ProtectedRoute>
        <ManagePerfumes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/orders",
    element: (
      <ProtectedRoute>
        <Orders />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
