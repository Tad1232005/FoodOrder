import React, { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import {Link} from "react-router-dom";


const Navbar = ({setShowLogin}) => {
    const [menu, setMenu] = useState("home");
    return (
        <div className="navbar">
            <img src={assets.logo} alt="" className="logo"/>
            <ul className="navbar-menu">
                <Link to="/" onClick={() => setMenu("home")} className={menu==="home" ? "active" : ""}>Home</Link>
                <a href="#explore-menu" onClick={() => setMenu("shop")} className={menu==="shop" ? "active" : ""}>Shop</a>
                <a href="#" onClick={() => setMenu("mobile-app")} className={menu==="mobile-app" ? "active" : ""}>Mobile-app</a>
                <a href="#footer" onClick={() => setMenu("contact")} className={menu==="contact" ? "active" : ""}>Contact us</a>
            </ul>
            <div className="navbar-right">
                <img src={assets.search_icon} alt="" />
                <div className="navbar-search-icon">
                    <img src={assets.basket_icon} alt="" />
                    <div className="dot"></div>
                </div>
                <button onClick={()=>setShowLogin(true)}>Sign in</button>
            </div>
        </div>
    )
}

export default Navbar