import cron from "node-cron";
import orderModel from "../models/orderModel.js";

// Chạy mỗi 15 phút, kiểm tra và xóa order Stripe chưa thanh toán quá 1 tiếng
const startCronJobs = () => {
    cron.schedule("*/15 * * * *", async () => {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            
            const result = await orderModel.deleteMany({
                paymentMethod: "stripe",
                payment: false,
                date: { $lt: oneHourAgo }  // tạo trước 1 tiếng
            });

            if (result.deletedCount > 0) {
                console.log(`Cleaned ${result.deletedCount} unpaid Stripe orders`);
            }
        } catch (error) {
            console.error("Cron job error:", error);
        }
    });

    console.log("Cron job started");
};

export default startCronJobs;