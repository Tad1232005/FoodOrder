import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// placing user order for frontend
const placeOrder = async (req, res) =>{

    const frontend_url = "http://localhost:5173";

    try {
        // 1. Tạo đơn hàng mới trong DB (trạng thái payment mặc định là false)
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });
        await newOrder.save();
        // 2. Xóa sạch giỏ hàng của user sau khi đã tạo đơn
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // 3. Chuẩn bị mảng dữ liệu line_items theo chuẩn quy định của Stripe
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 // Stripe tính bằng cent (nhân 100)
            },
            quantity: item.quantity
        }));
        // Thêm phí vận chuyển (Delivery Fee)
        line_items.push({
            price_data: {
                currency: "usd",
                product_data: {
                    name: "Delivery Fee"
                },
                unit_amount: 2 * 100
            },
            quantity: 1
        });
        // 4. Tạo session thanh toán trên Stripe
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify-order?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify-order?success=false&orderId=${newOrder._id}`,
        });

        // Trả về URL thanh toán để Frontend tự động chuyển hướng
        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
// Hàm xác thực thanh toán (khi Stripe điều hướng về lại web)
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}
export { placeOrder,verifyOrder };