import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <div className="footer" id="footer">
            <div className="footer-content">
                <div className="footer-content-left">
                    <p>Order your favourite food online. Fast delivery, fresh ingredients, and the best taste guaranteed.</p>
                    <div className="footer-social-icons">
                        <img src={assets.facebook_icon} alt="" />
                        <img src={assets.twitter_icon} alt="" />
                        <img src={assets.linkedin_icon} alt="" />
                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>QUICK LINKS</h2>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/shop">Menu</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                        <li><Link to="/myorders">My Orders</Link></li>
                    </ul>
                </div>
                <div className="footer-content-right">
                    <h2>CONTACT US</h2>
                    <ul>
                        <li>📍 123 Food Street, Ho Chi Minh City</li>
                        <li>📞 +84 123 456 789</li>
                        <li>✉️ support@foodorder.com</li>
                        <li>🕐 Mon - Sun: 7:00 - 22:00</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <hr />
                <p>© {new Date().getFullYear()} FoodOrder. All rights reserved.</p>
            </div>
        </div>
    )
}

export default Footer;