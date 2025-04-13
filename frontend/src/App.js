import "./App.css";
import HomePage from "./pages/HomePage.js";
import LoginSignupPage from "./pages/LoginSignupPage";
import ProfilePage from "./pages/ProfilePage";
import GroupPage from "./pages/GroupPage";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  BrowserRouter,
} from "react-router-dom";
// import { Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketContextProvider } from "./context/socketContext.js"; // Import your context provider

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="" element={<LoginSignupPage />} />
      <Route path="Home" element={<HomePage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="groups/:groupId" element={<GroupPage />} />
    </Route>
  )
);
function App() {
  
  return (
    <SocketContextProvider>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </SocketContextProvider>
  );
}

export default App;
