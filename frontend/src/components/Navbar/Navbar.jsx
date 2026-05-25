import React, { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Navbar = () => {
    const [menu, setMenu] = useState("home");
    // 1. GỌI THÊM searchTerm VÀ setSearchTerm TỪ CONTEXT
    const { getTotalCartAmount, token, setToken, searchTerm, setSearchTerm } = useContext(StoreContext); 
    // 2. TẠO STATE ĐIỀU KHIỂN ẨN/HIỆN Ô INPUT
    const [showSearch, setShowSearch] = useState(false); 
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        navigate("/");
    };

    return (
        <div className="navbar">
            <Link to="/"><img src={assets.logo} alt="" className="logo" /></Link>
            <ul className="navbar-menu">
                <Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>Home</Link>
                <a href="#explore-menu" onClick={() => setMenu("shop")} className={menu === "shop" ? "active" : ""}>Shop</a>
                <a href="#" onClick={() => setMenu("mobile-app")} className={menu === "mobile-app" ? "active" : ""}>Mobile-app</a>
                <a href="#footer" onClick={() => setMenu("contact")} className={menu === "contact" ? "active" : ""}>Contact us</a>
            </ul>
            <div className="navbar-right">
                
                {/* --- KHU VỰC TÌM KIẾM ĐÃ ĐƯỢC CHỈNH SỬA --- */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {showSearch && (
                        <input 
                            type="text" 
                            placeholder="Tìm món..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                padding: '5px 10px', 
                                borderRadius: '50px', 
                                border: '1px solid tomato', 
                                outline: 'none' 
                            }}
                        />
                    )}
                    <img 
                        src={assets.search_icon} 
                        alt="search" 
                        onClick={() => setShowSearch(!showSearch)} 
                        style={{ cursor: 'pointer' }}
                    />
                </div>
                {/* ----------------------------------------- */}

                <div className="navbar-search-icon">
                    <Link to="/cart"><img src={assets.basket_icon} alt="" /></Link>
                    <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
                </div>
                {!token
                    ? <button onClick={() => navigate("/login")}>Sign in</button>
                    : <div className="navbar-profile">
                        <img src={assets.profile_icon} alt="" />
                        <ul className="navbar-profile-dropdown">
                            <li onClick={()=>navigate("/myorders")}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
                            <hr />
                            <li onClick={logout}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
                        </ul>
                    </div>
                }
            </div>
        </div>
    );
};

export default Navbar;