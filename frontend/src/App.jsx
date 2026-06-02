import React from "react";
import Navbar from "./components/Navbar/Navbar";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Footer from "./components/Footer/Footer";
import UserAuth from "./components/Login/UserAuth";
import VerifyEmail from "./pages/Verify/VerifyEmail";
import SetPassword from "./pages/SetPassword/SetPassword";
import MyOrders from './pages/MyOrders/MyOrders';
import VerifyOrder from './pages/VerifyOrder/VerifyOrder';
import Shop from "./pages/Shop/Shop";
import FoodDetail from "./pages/FoodDetail/FoodDetail";
import Maintenance from "./pages/Maintenance/Maintenance.jsx";
import TrackOrder from "./pages/TrackOrder/TrackOrder";

const App = () => {
  const location = useLocation();
  const authRoutes = ["/login", "/verify-email", "/set-password"];
  const isAuthPage = authRoutes.includes(location.pathname);

    if (import.meta.env.VITE_MAINTENANCE === "true") {
    return <Maintenance />;
  }
  
  return (
    <>
      {!isAuthPage && <Navbar />}
      {isAuthPage
        ? <Routes>
          <Route path="/login" element={<UserAuth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/set-password" element={<SetPassword />} />   

        </Routes>
        : <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<PlaceOrder />} />
            <Route path='/verify-order' element={<VerifyOrder />} />
            <Route path="/myorders" element={<MyOrders />} />
            <Route path="/food/:id" element={<FoodDetail />} />
            <Route path="/track-order/:id" element={<TrackOrder />} />


          </Routes>
        </div>
      }
      {!isAuthPage && <Footer />}
    </>
  );
};

export default App;   