import express from "express";
import authMiddleware from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";
import { placeOrder, placeOrderCOD, verifyOrder,  userOrders, listOrders, updateStatus, markOrderAsPaid, deleteOrder  } from "../controllers/orderController.js";

const orderRouter = express.Router();

// User routes — dùng authMiddleware
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/placecod", authMiddleware, placeOrderCOD);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);

// Admin routes — dùng adminAuth
orderRouter.get("/list", adminAuth, listOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/markpaid", adminAuth, markOrderAsPaid);
orderRouter.post("/delete", adminAuth, deleteOrder);

export default orderRouter;