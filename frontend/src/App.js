import './App.css';
import HomePage from './pages/HomePage.js'
import LoginSignupPage from './pages/LoginSignupPage';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom';
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' >
      <Route path='' element={<LoginSignupPage/>}/>
      <Route path='Home' element={<HomePage/>}/>
    </Route>
  )
)
function App() {
  return (
    <div>
       <RouterProvider router={router} />
       {/* <BrowserRouter>
          <Routes>
          <Route path='' element={<LoginSignupPage/>}/>
          <Route path='Home' element={<HomePage/>}/>
          </Routes>
       </BrowserRouter> */}
    </div>

  );
}

export default App;
