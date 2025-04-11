import "./App.css";
import HomePage from "./pages/HomePage.js";
import LoginSignupPage from "./pages/LoginSignupPage";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  BrowserRouter,
} from "react-router-dom";
import { Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="" element={<LoginSignupPage />} />
      <Route path="Home" element={<HomePage />} />
    </Route>
  )
);
function App() {
  
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
