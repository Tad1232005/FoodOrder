import express from "express";
import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import { getReviews, addReview, deleteReview, getAllReviews, adminDeleteReview, getAllRatings} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// adminAuth vì chỉ admin/staff mới xóa được
reviewRouter.get("/all", adminAuth, getAllReviews);      // xem tất cả
reviewRouter.get("/ratings", getAllRatings);      
reviewRouter.delete("/admin/:reviewId", adminAuth, adminDeleteReview); // xóa bất kỳ

reviewRouter.get("/:foodId", getReviews);                          // public
reviewRouter.post("/:foodId", authMiddleware, addReview);          // cần login
reviewRouter.delete("/:reviewId", authMiddleware, deleteReview);   // cần login


export default reviewRouter;