import React, { useContext, useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Navbar = () => {
    const { getTotalCartAmount, token, setToken, food_list, url} = useContext(StoreContext);
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === "/";

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        navigate("/");
    };

    // Gợi ý tối đa 6 món
    const suggestions = searchText.trim()
        ? food_list
            .filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()))
            .slice(0, 6)
        : [];

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
                setShowSearch(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && searchText.trim()) {
            setShowDropdown(false);
            setShowSearch(false);
            navigate(`/shop?q=${encodeURIComponent(searchText.trim())}`);
            setSearchText("");
        }
        if (e.key === "Escape") {
            setShowDropdown(false);
            setShowSearch(false);
            setSearchText("");
        }
    };

    const handleSuggestionClick = (item) => {
        setShowDropdown(false);
        setShowSearch(false);
        setSearchText("");
        navigate(`/food/${item._id}`);
    };

    const handleViewAll = () => {
        setShowDropdown(false);
        setShowSearch(false);
        navigate(`/shop?q=${encodeURIComponent(searchText.trim())}`);
        setSearchText("");
    };

    // Active dựa theo URL thật, không cần state menu nữa
    const isActive = (path) => location.pathname === path ? "active" : "";

    return (
        <div className={`navbar ${isHome ? "navbar-sticky" : "navbar-static"}`}>
            <Link to="/"><img src={assets.logo} alt="" className="logo" /></Link>
            <ul className="navbar-menu">
                <Link to="/" className={isActive("/")}>Home</Link>
                <Link to="/shop" className={isActive("/shop")}>Shop</Link>
                <a href="#footer">Contact us</a>
            </ul>
            {/* phần còn lại giữ nguyên */}
            <div className="navbar-right">
                {/* SEARCH */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {showSearch && (
                        <div className="navbar-search-box">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchText}
                                autoFocus
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onKeyDown={handleKeyDown}
                            />

                            {/* Dropdown gợi ý */}
                            {showDropdown && searchText.trim() && (
                                <div className="search-dropdown">
                                    {suggestions.length > 0 ? (
                                        <>
                                            {suggestions.map(item => (
                                                <div
                                                    key={item._id}
                                                    className="search-dropdown-item"
                                                    onClick={() => handleSuggestionClick(item)}
                                                >
                                                    <img
                                                        src={`${url}/images/${item.images}`}
                                                        alt={item.name}
                                                    />
                                                    <div className="search-dropdown-info">
                                                        <p className="search-dropdown-name">{item.name}</p>
                                                        <p className="search-dropdown-price">${item.price}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div
                                                className="search-dropdown-viewall"
                                                onClick={handleViewAll}
                                            >
                                                🔍 Xem tất cả kết quả cho "<b>{searchText}</b>"
                                            </div>
                                        </>
                                    ) : (
                                        <div className="search-dropdown-empty">
                                            Không tìm thấy món nào 😔
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    <img src={assets.search_icon} alt="search" onClick={() => setShowSearch(!showSearch)} style={{ cursor: 'pointer' }} />
                </div>

                {/* CART */}
                <div className="navbar-search-icon">
                    <Link to="/cart"><img src={assets.basket_icon} alt="" /></Link>
                    <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
                </div>

                {/* AUTH */}
                {!token
                    ? <button onClick={() => navigate("/login")}>Sign in</button>
                    : <div className="navbar-profile">
                        <img src={assets.profile_icon} alt="" />
                        <ul className="navbar-profile-dropdown">
                            <li onClick={() => navigate("/myorders")}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
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