import userModel from "../models/userModel.js";

// Thêm món ăn vào giỏ hàng
const addToCart = async (req, res) => {
    try {
        // Lấy thông tin user từ database (userId này sẽ do Middleware cung cấp sau)
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;

        // Nếu món ăn chưa có trong giỏ -> số lượng = 1. Nếu có rồi -> cộng thêm 1
        if (!cartData[req.body.itemId]) 
        {
            cartData[req.body.itemId] = 1;
        } else {
            cartData[req.body.itemId] += 1;
        }

        // Cập nhật lại giỏ hàng vào Database
        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Item added to cart successfully." });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to add item to cart." });
    }
}

// Bớt món ăn khỏi giỏ hàng
const removeFromCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;

        // Nếu món ăn có trong giỏ và số lượng > 0 thì trừ đi 1
        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        res.json({ success: true, message: "Item removed from cart successfully." });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to remove item from cart." });
    }
}

// Lấy dữ liệu giỏ hàng của user
const getCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        res.json({ success: true, cartData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to fetch cart data." });
    }
}

export { addToCart, removeFromCart, getCart };