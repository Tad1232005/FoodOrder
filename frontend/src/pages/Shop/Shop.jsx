import React, { useContext, useState, useEffect } from "react";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import "./Shop.css";
import { useSearchParams } from "react-router-dom";
import SEO from "../../components/SEO/SEO";

const Shop = () => {
    const { food_list } = useContext(StoreContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [category, setCategory] = useState("All");
    const [sortBy, setSortBy] = useState("default");
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [searchText, setSearchText] = useState(searchParams.get("q") || "");

    const filtered = (food_list || [])
        .filter(item => category === "All" || item.category === category)
        .filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()))
        .filter(item => item.price >= priceRange[0] && item.price <= priceRange[1])
        .sort((a, b) => {
            if (sortBy === "price-asc") return a.price - b.price;
            if (sortBy === "price-desc") return b.price - a.price;
            if (sortBy === "name") return a.name.localeCompare(b.name);
            return 0;
        });

    useEffect(() => {
        const q = searchParams.get("q") || "";
        setSearchText(q);
    }, [searchParams]);

    // Khi user gõ trong shop search → update URL
    const handleShopSearch = (e) => {
        const val = e.target.value;
        setSearchText(val);
        if (val.trim()) {
            setSearchParams({ q: val });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div className="shop">
            <SEO
                title="Our Menu"
                description="Browse our full menu - fried chicken, burgers, pasta and more"
            />

            {/* HEADER */}
            <div className="shop-header">
                <h1>Our Menu</h1>
                <p>Explore all dishes from our kitchen</p>
            </div>

            {/* FILTER BAR */}
            <div className="shop-filter-bar">
                {/* Search */}
                <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchText}
                    onChange={handleShopSearch}
                    className="shop-search"
                />

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="shop-sort"
                >
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low → High</option>
                    <option value="price-desc">Price: High → Low</option>
                    <option value="name">Name A–Z</option>
                </select>

                {/* Price range */}
                <div className="shop-price-range">
                    <label>Max price: ${priceRange[1]}</label>
                    <input
                        type="range"
                        min="0"
                        max="200"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    />
                </div>

                {/* Reset */}
                {(category !== "All" || sortBy !== "default" || searchText || priceRange[1] !== 1000) && (
                    <button
                        className="shop-reset"
                        onClick={() => {
                            setCategory("All");
                            setSortBy("default");
                            setSearchText("");
                            setPriceRange([0, 1000]);
                        }}
                    >
                        Reset filters
                    </button>
                )}

                <span className="shop-count">{filtered.length} items</span>
            </div>

            {/* DANH MỤC */}
            {/* <ExploreMenu category={category} setCategory={setCategory} /> */}

            {/* GRID MÓN ĂN */}
            <div className="shop-body">
                {filtered.length === 0
                    ? <div className="shop-empty">
                        <p>No dishes found.</p>
                        <button onClick={() => { setCategory("All"); setSearchText(""); }}>
                            Clear filters
                        </button>
                    </div>
                    : <div className="shop-grid">
                        {filtered.map(item => (
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
                }
            </div>
        </div>
    );
};

export default Shop;