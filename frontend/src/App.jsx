import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
<<<<<<< HEAD
import LoginPopup from "./components/LoginPopup/LoginPopup";
=======
import UserAuth from "./components/Login/UserAuth";
import VerifyEmail from "./pages/Verify/VerifyEmail";
import SetPassword from "./pages/SetPassword/SetPassword";
import VerifyOrder from './pages/VerifyOrder/VerifyOrder';

>>>>>>> 190b2bd (Create place order feature and stripe payment integration ,done)
const App = () => {

const [showLogin,setShowLogin] = useState(false)

  return (
    <>
    {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <div className="app">
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />

        </Routes>
<<<<<<< HEAD
      </div>
      <Footer />
=======
        : <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<PlaceOrder />} />
            <Route path="/verify-order" element={<VerifyOrder />} />
          </Routes>
        </div>
      }
      {!isAuthPage && <Footer />}
>>>>>>> 190b2bd (Create place order feature and stripe payment integration ,done)
    </>
  )
}

export default App