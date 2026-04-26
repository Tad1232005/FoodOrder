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

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        url,
        token,
        setToken
    }
    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}
export default StoreContextProvider;