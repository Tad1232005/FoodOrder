import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

// Khởi tạo Stripe với Secret Key lấy từ file .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// API 1: Đặt hàng từ Frontend và tạo link thanh toán Stripe
const placeOrder = async (req, res) => {
    const frontend_url = "http://localhost:5173";

    try {
        // 1. Tạo đơn hàng mới lưu vào MongoDB (mặc định payment: false)
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });
        await newOrder.save();

        // 2. Xóa sạch giỏ hàng của user sau khi đã lên đơn 
        // await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // 3. Chuẩn bị dữ liệu mảng sản phẩm (line_items) để gửi cho Stripe
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 // Stripe tính bằng cent nên phải nhân 100
            },
            quantity: item.quantity
        }));

        // 4. Cộng thêm phí giao hàng (Delivery Charges) vào bill Stripe
        line_items.push({
            price_data: {
                currency: "usd",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: 2 * 100 // Phí ship 2$
            },
            quantity: 1
        });

        // 5. Tạo khung thanh toán (Checkout Session) của Stripe
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify-order?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify-order?success=false&orderId=${newOrder._id}`,
        });

        // Trả link giao diện quẹt thẻ của Stripe về cho Frontend
        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
// API: Đặt hàng COD (không cần Stripe)
const placeOrderCOD = async (req, res) => {
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            paymentMethod: "cod",
            payment: false  // chưa trả tiền, chờ shipper thu
        });
        await newOrder.save();

        // Xóa giỏ hàng như Stripe
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({ success: true, message: "Order placed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// API 2: Xác thực thanh toán sau khi Stripe trả về
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        // Nếu URL trả về success=true -> Cập nhật DB thành đã thanh toán (true)
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            // ← Chỉ xóa cart khi thanh toán thành công
            const order = await orderModel.findById(orderId);
            res.json({ success: true, message: "Paid" });
        } else {
            // Hủy → xóa order rác, cart trong DB vẫn còn nguyên
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

//  người dùng đặt hàng của frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({
            userId: req.body.userId,
            $or: [
                { payment: true },                    // đã thanh toán
                { paymentMethod: "cod" }              // COD không cần payment true
            ]
        });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

//Danh sách đơn hàng của admin
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

//api để cập nhật trạng thái đơn hàng
const updateStatus = async (req, res) => {
    try {
        const updateData = { status: req.body.status };

        // Nếu admin đánh dấu "Delivered" → tự động set payment = true cho COD
        if (req.body.status === "Delivered") {
            const order = await orderModel.findById(req.body.orderId);
            if (order.paymentMethod === "cod") {
                updateData.payment = true;
            }
        }

        await orderModel.findByIdAndUpdate(req.body.orderId, updateData);
        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// Mark as Paid cho COD
const markOrderAsPaid = async (req, res) => {
    try {
        const order = await orderModel.findById(req.body.orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });
        if (order.paymentMethod !== "cod") return res.json({ success: false, message: "Only COD orders" });

        await orderModel.findByIdAndUpdate(req.body.orderId, { payment: true });
        res.json({ success: true, message: "Marked as paid" });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

// Xóa đơn
const deleteOrder = async (req, res) => {
    try {
        await orderModel.findByIdAndDelete(req.body.orderId);
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

export {
    placeOrder,
    placeOrderCOD,
    verifyOrder,
    userOrders,
    listOrders,
    updateStatus,
    markOrderAsPaid,
    deleteOrder
};