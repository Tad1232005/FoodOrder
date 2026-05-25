import { createContext, useEffect, useState } from "react";
import axios from "axios";
// import { food_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const url = "http://localhost:4000";
    const [token, setToken] = useState();
    const [food_list, setFoodList] = useState([]);

    const addToCart = async (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1,
        }));

        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const newCart = { ...prev };
            if (newCart[itemId] > 1) {
                newCart[itemId] -= 1;
            } else {
                delete newCart[itemId];
            }
            return newCart;
        });

        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        }
    };

    useEffect(() => {
        console.log(cartItems);
    }, [cartItems]);

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find(
                    (product) => product._id === item
                );

                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    const fetchFoodList = async () => {
        const response = await axios.get(url + "/api/food/list");
        setFoodList(response.data.data);
    };

    // SỬA TẠI ĐÂY: Thêm tham số `localCart` để gửi giỏ hàng tạm lên Backend gộp dữ liệu
    const loadCartData = async (authToken, localCart = {}) => {
        try {
            const response = await axios.post(
                url + "/api/cart/get",
                { guestCart: localCart }, // Gửi kèm giỏ hàng hiện tại trên giao diện lên
                { headers: { token: authToken } }
            );
            setCartItems(response.data?.cartData || response.data?.data?.cart || {});
        } catch (error) {
            console.error("Error loading cart:", error);
        }
    };

    useEffect(() => {
        async function fetchInitialData() {
            await fetchFoodList();
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                setToken(storedToken);
                // Nếu vừa đặt hàng xong thì không load lại cart
                const justOrdered = sessionStorage.getItem("justOrdered");
                if (justOrdered) {
                    sessionStorage.removeItem("justOrdered"); // xóa flag
                } else {
                    await loadCartData(storedToken); // Khi F5, localCart trống nên không cần truyền
                }
            }
        }
        fetchInitialData();
    }, []);

    const clearCart = () => {
        setCartItems({});
    };
    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        url,
        token,
        setToken,
        loadCartData, // SỬA TẠI ĐÂY: Xuất hàm này ra để file Login có thể gọi được ngay lập tức!
        clearCart,
    };
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;