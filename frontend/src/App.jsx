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

const App = () => {
  const location = useLocation();
  const authRoutes = ["/login", "/verify-email", "/set-password"];
  const isAuthPage = authRoutes.includes(location.pathname);

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
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<PlaceOrder />} />
            <Route path='/verify-order' element={<VerifyOrder />} />
            {/* ĐÂY LÀ ROUTE CỦA BẠN VỪA ĐƯỢC THÊM VÀO */}
            <Route path="/myorders" element={<MyOrders />} />
            
          </Routes>
        </div>
      }
      {!isAuthPage && <Footer />}
    </>
  );
};

export default App;   