import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    cartData: { type: Object, default: {} },
    role: { type: String, enum: ["admin", "staff", "customer"], default: "customer" },
    isBlocked: { type: Boolean, default: false },
    
        // ── Email verification ──
    isVerified:       { type: Boolean, default: false },
    verifyCode:       { type: String, default: null },      // mã 6 số
    verifyCodeExpiry: { type: Date,   default: null },      // hết hạn sau 10 phút

    inviteToken:       { type: String, default: null },  // hashed token lưu DB
    inviteTokenExpiry: { type: Date,   default: null },  // hết hạn sau 24h
}, { minimize: false, timestamps: true })

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel; 