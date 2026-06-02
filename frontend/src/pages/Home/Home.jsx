import React, { useState } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import SEO from "../../components/SEO/SEO";

const Home = () => {
    const [category, setCategory] = useState("All");
    return (
        <div>
            <SEO
                title="Home"
                description="Order your favourite food online - fast delivery, best price"
            />
            <Header />
            <ExploreMenu category={category} setCategory={setCategory} />
            <FoodDisplay category={category} />
        </div>
    )
}

export default Home;