import userModel from "../models/userModel.js";

// Thêm món ăn vào giỏ hàng
const addToCart = async (req, res) => {
    try {
        // Lấy thông tin user từ database (userId này sẽ do Middleware cung cấp sau)
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData || {}; // Tránh lỗi nếu cartData chưa tồn tại

        // Nếu món ăn chưa có trong giỏ -> số lượng = 1. Nếu có rồi -> cộng thêm 1
        if (!cartData[req.body.itemId]) {
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
        let cartData = userData.cartData || {}; // Giỏ hàng đang có trong DB

        // Lấy giỏ hàng tạm (guestCart) từ Frontend gửi lên qua body
        const { guestCart } = req.body;

        // Nếu khách có thêm món lúc chưa login, tiến hành gộp dữ liệu
        if (guestCart && typeof guestCart === "object" && Object.keys(guestCart).length > 0) {
            for (const itemId in guestCart) {
                if (guestCart[itemId] > 0) {
                    // Cộng dồn: Số lượng trong DB = Số lượng cũ + Số lượng tạm thời
                    cartData[itemId] = (cartData[itemId] || 0) + guestCart[itemId];
                }
            }
            // Lưu ngay lập tức giỏ hàng đã gộp này vào MongoDB
            await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        }
        
        res.json({ success: true, cartData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to fetch cart data." });
    }
}

export { addToCart, removeFromCart, getCart };