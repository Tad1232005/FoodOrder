import reviewModel from "../models/reviewModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// GET /api/review/:foodId — lấy reviews của món
const getReviews = async (req, res) => {
    try {
        const reviews = await reviewModel
            .find({ foodId: req.params.foodId })
            .sort({ date: -1 });

        // Tính rating trung bình
        const total = reviews.length;
        const avg = total > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
            : 0;

        // Đếm từng mức sao
        const breakdown = [5, 4, 3, 2, 1].map(star => ({
            star,
            count: reviews.filter(r => r.rating === star).length
        }));

        res.json({ success: true, data: { reviews, avg: Number(avg), total, breakdown } });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

// POST /api/review/:foodId — thêm review (cần login)
const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/javascript:/gi, "")
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
};
const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const foodId = req.params.foodId;
        const userId = req.body.userId; // từ authMiddleware

        if (!rating || rating < 1 || rating > 5) {
            return res.json({ success: false, message: "Rating is required (1-5)" });
        }

        // Lấy userName từ DB — không tin frontend gửi lên
        const user = await userModel.findById(userId).select("name");
        const userName = user?.name || "Anonymous";

        // Kiểm tra đã review chưa
        const existing = await reviewModel.findOne({ foodId, userId });
        if (existing) {
            return res.json({ success: false, message: "You have already reviewed this item" });
        }

        // Kiểm tra đã từng đặt món này chưa (optional nhưng thực tế hơn)
        const hasBought = await orderModel.findOne({
            userId,
            "items._id": foodId,
            payment: true
        });
        if (!hasBought) {
            return res.json({ success: false, message: "You need to purchase this item before reviewing" });
        }

        // Sanitize trước khi lưu
        const cleanComment = sanitizeString(comment || "");

        const review = new reviewModel({ foodId, userId, userName, rating, comment: cleanComment });
        await review.save();

        res.json({ success: true, message: "Review added" });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

// DELETE /api/review/:reviewId — xóa review (chỉ của mình)
const deleteReview = async (req, res) => {
    try {
        const review = await reviewModel.findById(req.params.reviewId);
        if (!review) return res.json({ success: false, message: "Review not found" });
        if (review.userId !== req.body.userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }
        await reviewModel.findByIdAndDelete(req.params.reviewId);
        res.json({ success: true, message: "Review deleted" });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

// GET /api/review/all — admin xem tất cả reviews
const getAllReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.find({}).sort({ date: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

// DELETE /api/review/admin/:reviewId — admin xóa bất kỳ review
const adminDeleteReview = async (req, res) => {
    try {
        const review = await reviewModel.findByIdAndDelete(req.params.reviewId);
        if (!review) return res.json({ success: false, message: "Review not found" });
        res.json({ success: true, message: "Review deleted" });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

// reviewController.js
const getAllRatings = async (req, res) => {
    try {
        const reviews = await reviewModel.find({});

        // Group theo foodId, tính avg
        const ratings = {};
        reviews.forEach(r => {
            if (!ratings[r.foodId]) {
                ratings[r.foodId] = { total: 0, count: 0 };
            }
            ratings[r.foodId].total += r.rating;
            ratings[r.foodId].count += 1;
        });

        // Tính avg cho từng food
        const result = {};
        Object.keys(ratings).forEach(foodId => {
            result[foodId] = Number((ratings[foodId].total / ratings[foodId].count).toFixed(1));
        });

        res.json({ success: true, data: result });
    } catch (error) {
        res.json({ success: false, message: "Error" });
    }
};

export { getReviews, addReview, deleteReview, getAllReviews, adminDeleteReview, getAllRatings };