// server/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

// Login: tối đa 5 lần sai / 15 phút / 1 IP
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many attempts, try again later" }
});

// Register: tối đa 3 tài khoản / giờ / 1 IP  
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { success: false, message: "Too many registrations, try again later" }
});

// Resend OTP: tối đa 3 lần / 10 phút / 1 IP
export const resendVerifyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: { success: false, message: "Too many resend attempts. Please try again later." }
});