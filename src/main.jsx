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
    element: <Addnewperfume />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/addnewuser",
    element: <Addnewuser />,
  },
  {
    path: "/adminpage",
    element: <Adminpage />,
  },
  {
    path: "/managePerfumes",
    element: <ManagePerfumes />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
