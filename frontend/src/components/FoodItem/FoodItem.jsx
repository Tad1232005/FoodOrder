import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import StarRating from "../StarRating/StarRating";
import { useNavigate } from "react-router-dom";

const FoodItem = ({ id, name, price, description, images }) => {
    const { cartItems, addToCart, removeFromCart, url, foodRatings } = useContext(StoreContext);
    const navigate = useNavigate();
    const rating = foodRatings?.[id] || 0;

    return (
        <div className="food-item">
            <div className="food-item-img-container" onClick={() => navigate(`/food/${id}`)} style={{ cursor: "pointer" }}>

                <img className="food-item-image" src={url + "/images/" + (Array.isArray(images) ? images[0] : images)} alt="" />
                {!cartItems[id]
                    ? <img className="add" onClick={() => addToCart(id)} src={assets.add_icon_white} alt="" />
                    : <div className="food-item-counter">
                        <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="" />
                        <p>{cartItems[id]}</p>
                        <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="" />
                    </div>
                }
            </div>
            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p onClick={() => navigate(`/food/${id}`)} style={{ cursor: "pointer" }}>{name}</p>
                    <StarRating rating={rating} size={22} />
                </div>
                <p className="food-item-desc">{description}</p>
                <p className="food-item-price">${price}</p>
            </div>
        </div>
    )
}

export default FoodItem;