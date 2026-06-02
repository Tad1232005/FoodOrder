import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import discountModel from "../models/discountModel.js";
import Stripe from "stripe";

// Khởi tạo Stripe với Secret Key lấy từ file .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// API 1: Đặt hàng từ Frontend và tạo link thanh toán Stripe
const placeOrder = async (req, res) => {
    const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
    try {
        // 1. Tạo đơn hàng mới lưu vào MongoDB (mặc định payment: false)
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });
        await newOrder.save();

        // 2. ĐÁNH DẤU TÀI KHOẢN ĐÃ SỬ DỤNG MÃ GIẢM GIÁ (STRIPE)
        if (req.body.promoCode) {
            await discountModel.findOneAndUpdate(
                { code: req.body.promoCode },
                { $addToSet: { usedBy: req.body.userId } }
            );
        }

        // 3. Chuẩn bị dữ liệu mảng sản phẩm (line_items)
        // DÙNG 'let' ĐỂ CÓ THỂ CHỈNH SỬA Ở DƯỚI
        let line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 // Stripe tính bằng cent nên phải nhân 100
            },
            quantity: item.quantity
        }));

        // 4. Xử lý logic tiền bạc với Stripe
        if (req.body.discountAmount && req.body.discountAmount > 0) {
            // NẾU CÓ GIẢM GIÁ: Xóa các món lẻ, gom thành 1 bill tổng duy nhất
            // (Tránh lỗi Stripe cộng dồn cả món ăn + bill tổng)
            line_items = [{
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Food Order Total (Promo Code Applied)"
                    },
                    unit_amount: Math.round(req.body.amount * 100)
                },
                quantity: 1
            }];
        } else {
            // NẾU KHÔNG GIẢM GIÁ: Giữ nguyên mảng món ăn ở trên, chỉ cộng thêm phí ship
            line_items.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Delivery Charges"
                    },
                    unit_amount: 2 * 100
                },
                quantity: 1
            });
        }

        // 5. Tạo khung thanh toán (Checkout Session) của Stripe
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify-order?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify-order?success=false&orderId=${newOrder._id}`,
        });

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
            payment: false
        });
        await newOrder.save();

        // --- ĐÁNH DẤU TÀI KHOẢN ĐÃ SỬ DỤNG MÃ GIẢM GIÁ (COD) ---
        if (req.body.promoCode) {
            await discountModel.findOneAndUpdate(
                { code: req.body.promoCode },
                { $addToSet: { usedBy: req.body.userId } }
            );
        }

        // Xóa giỏ hàng
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
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            const order = await orderModel.findById(orderId);
            await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
            res.json({ success: true, message: "Paid" });
        } else {
            // Khách hủy thanh toán -> Xóa đơn rác
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// Lấy lịch sử đơn hàng của User
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({
            userId: req.body.userId,
            $or: [
                { payment: true },
                { paymentMethod: "cod" }
            ]
        });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// Danh sách đơn hàng cho Admin
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// Cập nhật trạng thái đơn hàng (Admin)
const updateStatus = async (req, res) => {
    try {
        const updateData = { status: req.body.status };
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

// Đánh dấu COD đã thanh toán
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