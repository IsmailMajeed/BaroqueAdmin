import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Layout from "./Components/Layout";
import Dashboard from "./Pages/Dashboard";
import Products from "./Pages/Product";
import NewProduct from "./Pages/products/new";
import Categories from "./Pages/Categories";
import Order from "./Pages/Order";
import DeleteProductPage from "./Pages/products/delete/deleteProduct";
import EditProductPage from "./Pages/products/edit/editProduct";
import Login from "./Pages/Login";
import Featured from "./Pages/Featured";
import Settings from "./Pages/Settings";
import { UserContextProvider } from './userContext';
import axios from "axios";
import { PREFIX } from "./Constants";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center h-screen justify-center">
      <h1 className="text-red-700">404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go back to the home page</Link>
    </div>
  );
};

function App() {
  axios.defaults.baseURL = PREFIX;
  return (
    <div className="App bg-gray-50">
      <UserContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/Account/Login" element={<Login />} />
            <Route path="/" element={<Layout />} >
              <Route index path="/" element={<Dashboard name="Ismail" image={`${PREFIX}uploads/Ismail.png`} />} />
              <Route path="/Featured" element={<Featured />} />
              <Route path="/Products" element={<Products />} />
              <Route path="/Products/delete/:id" element={<DeleteProductPage />} />
              <Route path="//Products/edit/:id" element={<EditProductPage />} />
              <Route path="/Products/new" element={<NewProduct />} />
              <Route path="/Categories" element={<Categories />} />
              <Route path="/Orders" element={<Order />} />
              <Route path="/Settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserContextProvider>
    </div>
  );
}

export default App;