import express from "express";
import { adminCreateUser, adminDeleteUser, adminSetBlocked, getMe, listUsers, loginUser, registerUser, updateUserRole } from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";
import authMiddleware from "../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter.js";
import { verifyEmail, resendVerifyCode } from "../controllers/userController.js";
import { resendVerifyLimiter } from "../middleware/rateLimiter.js";
const userRouter = express.Router();

userRouter.post("/register", registerLimiter, registerUser);
userRouter.post("/login", loginLimiter, loginUser);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/resend-verify", resendVerifyLimiter, resendVerifyCode);
userRouter.get("/me", authMiddleware, getMe);
userRouter.get("/list", adminAuth, listUsers);
userRouter.post("/role", adminAuth, updateUserRole);
userRouter.post("/create", adminAuth, adminCreateUser);
userRouter.post("/block", adminAuth, adminSetBlocked);
userRouter.post("/delete", adminAuth, adminDeleteUser);

export default userRouter;