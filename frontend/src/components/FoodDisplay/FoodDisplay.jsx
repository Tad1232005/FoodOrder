import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category }) => {
    // 1. Lấy thêm searchTerm từ StoreContext
    const { food_list, searchTerm } = useContext(StoreContext);

    return (
        <div className="food-display" id="food-display">
            <h2>Top dishes near you</h2>
            <div className="food-display-list">
                {/* bỏ if else xài .filter */}
                {food_list
                    // 2. Lọc theo từ khóa tìm kiếm (chuyển hết về chữ thường để tìm chính xác)
                    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    // 3. Lọc theo danh mục (code cũ của bạn)
                    .filter(item => category === "All" || category === item.category) 
                    // 4. Hiển thị ra màn hình
                    .map((item) =>  
                    (<FoodItem
                        key={item._id} id={item._id}
                        name={item.name} price={item.price}
                        description={item.description} image={item.image} />
                    ))
                }
            </div>
        </div>
    )
}

export default FoodDisplay;