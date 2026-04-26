import { createContext, useEffect, useState } from "react";
import { food_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const url = "http://localhost:4000";
    const [token, setToken] = useState();

    const addToCart = (itemId) => {
        /*Hàm add cũ*/
        // if (!cartItems[itemId]) {
        //     setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        // }
        // else {
        //     setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        // }
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    }

    const removeFromCart = (itemId) => {
        /*Hàm remove cũ*/
        // if (cartItems[itemId] === 1) {
        //     // Remove the item if the quantity becomes zero
        //     const newCartItems = { ...cartItems };
        //     delete newCartItems[itemId];
        //     setCartItems(newCartItems);
        // } else {
        //     setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        // }

        setCartItems((prev) => {
            const newCart = { ...prev };
            if (newCart[itemId] > 1) {
                newCart[itemId] -= 1;
            } else {
                delete newCart[itemId];
            }
            return newCart;
        })

    };

    useEffect(() => {
        console.log(cartItems);
    }, [cartItems])

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                // Tìm thông tin món ăn từ food_list dựa trên ID
                let itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };
    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        url,
        token,
        setToken
        getTotalCartAmount,
    }
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}
export default StoreContextProvider;