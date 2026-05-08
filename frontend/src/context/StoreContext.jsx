import { createContext, useEffect, useState } from "react";
// import { food_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const [cartItems, setCartItems] = useState({});
    const url = "http://localhost:4000";
    const [token, setToken] = useState();
    const [food_list, setFoodList] = useState([]);

    const addToCart = async (itemId) => {
        /*Hàm add cũ*/
        // if (!cartItems[itemId]) {
        //     setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        // }
        // else {
        //     setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        // }
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));

        if (token) {
            await aixos.post(url + "/api/cart/add", { token, itemId });
        }
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

        if (token) {
            await aixos.post(url + "/api/cart/remove", { token, itemId });
            setFoodList(response.data.data)
        }

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

    const fetchFoodList = async () => {
        const response = await axios.get(url + "/api/food_list");
        setFoodList(response.data.data);
    }

    const loadData = async (token) => {
        const response = await axios.get(url + "/api/user/profile", {}, { headers: { token } });
        setCartItems(response.data.data.cart);
    }
    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"));
                await localCartData(localStorage.getItem("token"));
            }
        }
        loadData();
    })
    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
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