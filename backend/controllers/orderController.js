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
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

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

// API 2: Xác thực thanh toán sau khi Stripe trả về
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        // Nếu URL trả về success=true -> Cập nhật DB thành đã thanh toán (true)
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" });
        } else {
            // Nếu khách hủy thanh toán -> Xóa đơn hàng nháp đó đi
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export { placeOrder, verifyOrder };
//Danh sách đơn hàng của admin
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
}   catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

//api để cập nhật trạng thái đơn hàng
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export { listOrders, updateStatus }