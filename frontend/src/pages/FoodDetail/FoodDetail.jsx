import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import StarRating from "../../components/StarRating/StarRating";
import ReviewForm from "../../components/ReviewForm/ReviewForm";
import ReviewList from "../../components/ReviewList/ReviewList";
import FoodItem from "../../components/FoodItem/FoodItem";
import axios from "axios";
import "./FoodDetail.css";
import SEO from "../../components/SEO/SEO";

const FoodDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { url, token, cartItems, addToCart, removeFromCart, food_list, foodRatings } = useContext(StoreContext);

    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewData, setReviewData] = useState({ reviews: [], avg: 0, total: 0, breakdown: [] });
    const [quantity, setQuantity] = useState(1);
    const [activeImg, setActiveImg] = useState(0);

    // Lấy userId từ token (decode đơn giản)
    const getCurrentUserId = () => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.id;
        } catch { return null; }
    };

    const fetchFood = async () => {
        try {
            const res = await axios.get(`${url}/api/food/item/${id}`);
            if (res.data.success) {
                setFood(res.data.data);
            } else {
                navigate("/shop");
            }
        } catch {
            navigate("/shop");
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${url}/api/review/${id}`);
            if (res.data.success) setReviewData(res.data.data);
        } catch { }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await axios.delete(`${url}/api/review/${reviewId}`,
                { data: {}, headers: { token } }
            );
            fetchReviews();
        } catch { }
    };

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(food._id);
        }
    };

    useEffect(() => {
        setFood(null);
        setLoading(true);
        setReviewData({ reviews: [], avg: 0, total: 0, breakdown: [] }); // reset
        setActiveImg(0);
        setQuantity(1);
        fetchFood();
        fetchReviews();
        window.scrollTo(0, 0);
    }, [id]);

    // Sản phẩm liên quan — cùng category, khác id
    const related = food_list
        .filter(item => food && item.category === food.category && item._id !== id)
        .slice(0, 4);

    if (loading) {
        return (
            <div className="fd-loading">
                <div className="fd-spinner" />
            </div>
        );
    }

    if (!food) return null;

    const images = food.images?.length > 0 ? food.images : [food.image];

    return (
        <div className="fd-page">
            {food && (
                <SEO
                    title={food.name}
                    description={food.description}
                    image={`${url}/images/${food.image}`}
                />
            )}
            {/* BREADCRUMB */}
            <div className="fd-breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/shop">Shop</Link>
                <span>/</span>
                <span>{food.name}</span>
            </div>

            {/* MAIN SECTION */}
            <div className="fd-main">
                {/* CỘT TRÁI: ẢNH */}
                <div className="fd-images">
                    <div className="fd-img-main">
                        <img
                            src={`${url}/images/${images[activeImg]}`}
                            alt={food.name}
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="fd-img-thumbs">
                            {images.map((img, i) => (
                                <img
                                    key={i}
                                    src={`${url}/images/${img}`}
                                    alt=""
                                    className={activeImg === i ? "active" : ""}
                                    onClick={() => setActiveImg(i)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* CỘT PHẢI: INFO */}
                <div className="fd-info">
                    {/* Category badge */}
                    <span className="fd-category">{food.category}</span>

                    {/* Tên */}
                    <h1 className="fd-name">{food.name}</h1>

                    {/* Rating */}
                    <div className="fd-rating">
                        <StarRating rating={reviewData.avg} size={20} />
                        <span className="fd-rating-avg">{reviewData.avg > 0 ? reviewData.avg : "No ratings"}</span>
                        <span className="fd-rating-count">({reviewData.total} reviews)</span>
                    </div>

                    {/* Giá */}
                    <div className="fd-price">${food.price}</div>

                    {/* Mô tả */}
                    <p className="fd-desc">{food.description}</p>

                    <hr className="fd-divider" />

                    {/* Chọn số lượng + thêm giỏ */}
                    <div className="fd-actions">
                        <div className="fd-qty">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >−</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                        <button className="fd-add-btn" onClick={handleAddToCart}>
                            🛒 Add to Cart
                        </button>
                    </div>

                    {/* Đã có trong giỏ */}
                    {cartItems[food._id] > 0 && (
                        <p className="fd-in-cart">
                            ✓ {cartItems[food._id]} in cart
                        </p>
                    )}
                </div>
            </div>

            {/* REVIEWS */}
            <div className="fd-reviews">
                <h2>Customer Reviews</h2>
                <div className="fd-reviews-layout">
                    {/* Review form bên trái */}
                    <div className="fd-reviews-form">
                        <ReviewForm
                            foodId={id}
                            onReviewAdded={fetchReviews}
                        />
                    </div>
                    {/* Review list bên phải */}
                    <div className="fd-reviews-list">
                        <ReviewList
                            reviews={reviewData.reviews}
                            avg={reviewData.avg}
                            total={reviewData.total}
                            breakdown={reviewData.breakdown}
                            currentUserId={token ? getCurrentUserId() : null}
                            onDelete={handleDeleteReview}
                        />
                    </div>
                </div>
            </div>
            {/* SẢN PHẨM LIÊN QUAN */}
            {related.length > 0 && (
                <div className="fd-related">
                    <h2>Related Dishes</h2>
                    <div className="fd-related-grid">
                        {related.map(item => (
                            <FoodItem
                                key={item._id}
                                id={item._id}
                                name={item.name}
                                price={item.price}
                                description={item.description}
                                images={item.images}
                                rating={foodRatings[item._id] || 0}
                            />
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

export default FoodDetail;