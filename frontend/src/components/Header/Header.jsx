import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header>
            <div className="header">
                <div className="header-contents">
                    <h2>Order Your Favourite Food Here</h2>
                    <p>
                        Choose from a diverse menu featuring a delectable array of dishes
                        crafted with the finest ingredients and culinary expertise. Our
                        mission is to satisfy your cravings and elevate your dining
                        experience, one delicious meal at a time.
                    </p>
                    <Link to="/shop">
                        <button>View Menu</button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;