import React, { useState, useEffect, useContext } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import FoodItem from "../../components/FoodItem/FoodItem";
import SEO from "../../components/SEO/SEO";
import { StoreContext } from "../../context/StoreContext";

const Home = () => {
    const [category, setCategory] = useState("All");
    const { food_list, foodRatings, url } = useContext(StoreContext);
    const [currentBanner, setCurrentBanner] = useState(0);



    // ← THAY 3 ẢNH NÀY, để ảnh trong public/ rồi dùng "/ten-anh.jpg"
    const bannerImages = [
        "/banner1.jpg",
        "/banner2.jpg",
        "/banner3.jpg",
    ];

    const extendedBanners = [...bannerImages, bannerImages[0]];
    const [isTransitioning, setIsTransitioning] = useState(true);
    // Auto slide mỗi 3 giây
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % bannerImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Khi đến clone (index = length), reset về 0 không có animation
    useEffect(() => {
        if (currentBanner === bannerImages.length) {
            setTimeout(() => {
                setIsTransitioning(false);
                setCurrentBanner(0);
            }, 500); // đợi animation xong rồi mới reset
        } else {
            setIsTransitioning(true);
        }
    }, [currentBanner]);

    // Top 4 món rating cao nhất
    const topRated = [...food_list]
        .filter(item => (foodRatings?.[item._id] || 0) > 0)
        .sort((a, b) => (foodRatings[b._id] || 0) - (foodRatings[a._id] || 0))
        .slice(0, 5);
    return (
        <div>
            <SEO
                title="Home"
                description="Order your favourite food online - fast delivery, best price"
            />
            <Header />
            <ExploreMenu category={category} setCategory={setCategory} />
            <FoodDisplay category={category} />
            {/* 3. VIDEO SECTION */}
            <div className="home-video-section">
                <div className="home-video-text">
                    <h2>Fresh Ingredients, Amazing Taste</h2>
                    <p>Watch how we prepare your food with love and care</p>
                </div>
                <div className="home-video-wrap">
                    <video
                        src="/test.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="home-video"
                    />
                </div>
            </div>

            {/* 4. TOP RATED */}
            {topRated.length > 0 && (
                <div className="home-top-rated">
                    <h2>⭐ Top Rated Dishes</h2>
                    <p>Most loved by our customers</p>
                    <div className="home-top-rated-grid">
                        {topRated.map(item => (
                            <FoodItem
                                key={item._id}
                                id={item._id}
                                name={item.name}
                                price={item.price}
                                description={item.description}
                                images={item.images}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 5. BANNER CAROUSEL */}
            <div className="home-banner">
                <div className="home-banner-track"
                    style={{
                        transform: `translateX(-${currentBanner * 100}%)`,
                        transition: isTransitioning ? "transform 0.5s ease" : "none"
                    }}
                >
                    {extendedBanners.map((img, i) => (
                        <div key={i} className="home-banner-slide">
                            <img src={img} alt={`Banner ${i + 1}`} className="home-banner-img" />
                            {/* Overlay + text theo từng slide */}
                            <div className="home-banner-overlay" />
                            <div className="home-banner-text">
                                {i === 0 && <>
                                    <span className="home-banner-tag">🔥 Hot Deal</span>
                                    <h3>Enjoy Your Favourite Food</h3>
                                    <p>Order now and get free delivery on your first order</p>
                                </>}
                                {i === 1 && <>
                                    <span className="home-banner-tag">🍗 Fresh Daily</span>
                                    <h3>Made With Love & Care</h3>
                                    <p>Fresh ingredients, amazing taste — every single day</p>
                                </>}
                                {i === 2 && <>
                                    <span className="home-banner-tag">🎉 Special Offer</span>
                                    <h3>Treat Yourself Today</h3>
                                    <p>Explore our menu and find your next favourite dish</p>
                                </>}
                                {/* Clone của banner 1 */}
                                {i === 3 && <>
                                    <span className="home-banner-tag">🔥 Hot Deal</span>
                                    <h3>Enjoy Your Favourite Food</h3>
                                    <p>Order now and get free delivery on your first order</p>
                                </>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dots */}
                <div className="home-banner-dots">
                    {bannerImages.map((_, i) => (
                        <span
                            key={i}
                            className={`home-banner-dot ${(currentBanner % bannerImages.length) === i ? "active" : ""}`}
                            onClick={() => setCurrentBanner(i)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Home;