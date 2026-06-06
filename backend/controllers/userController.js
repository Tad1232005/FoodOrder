import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { sendVerifyEmail } from "../middleware/mailer.js";
import { randomBytes } from "crypto";
import { sendInviteEmail } from "../utils/sendMail.js";

// ── Helpers ────────────────────────────────────────────────────────────────

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET);

const sanitizeUser = (u) => ({
    _id: u?._id,
    name: u?.name,
    email: u?.email,
    role: u?.role,
    createdAt: u?.createdAt,
    updatedAt: u?.updatedAt,
});

// Tạo mã 6 số ngẫu nhiên
const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

// ── Login ──────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    // Chặn NoSQL injection
    if (typeof email !== "string" || typeof password !== "string") {
        return res.json({ success: false, message: "Invalid input" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "This account does not exist!" });
        if (user.isBlocked) return res.json({ success: false, message: "This account is blocked." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: "Incorrect password!" });

        // Chặn login nếu chưa xác thực email
        if (!user.isVerified) {
            // Gửi lại mã mới nếu họ thử login mà chưa verify
            const code = generateCode();
            user.verifyCode = code;
            user.verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
            await user.save();
            await sendVerifyEmail(user.email, code);
            return res.json({
                success: false,
                needVerify: true, // frontend dùng flag này để redirect sang trang verify
                email: user.email,
                message: "Please verify your email. A new code has been sent."
            });
        }

        const token = createToken(user._id);
        res.json({ success: true, token, user: sanitizeUser(user) });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Sign-in error" });
    }
};

// ── Register ───────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        const exists = await userModel.findOne({ email });
        if (exists) return res.json({ success: false, message: "This email has already been used!" });
        if (!validator.isEmail(email)) return res.json({ success: false, message: "Please enter a valid email!" });
        if (password.length < 8) return res.json({ success: false, message: "The password must be at least 8 characters long!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const code = generateCode();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            role: "customer",
            isVerified: false,
            verifyCode: code,
            verifyCodeExpiry: expiry,
        });

        // 1. Lưu DB
        await newUser.save();

        // 2. Cố gắng gửi mail OTP
        try {
            await sendVerifyEmail(email, code);
            return res.json({
                success: true,
                needVerify: true,
                email,
                message: "Registration successful! Please check your email for the verification code."
            });
        } catch (mailError) {
            console.error("MAIL OTP ERROR:", mailError);
            // Nếu mail kẹt/lỗi, xóa user đi để họ có thể đăng ký lại
            await userModel.findByIdAndDelete(newUser._id);
            return res.json({ success: false, message: "Lỗi gửi mail OTP. Đăng ký không thành công!" });
        }

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Sign-up error" });
    }
};

// ── Verify Email ───────────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "Account not found" });
        if (user.isVerified) return res.json({ success: false, message: "Email already verified" });

        // Kiểm tra mã có đúng không
        if (user.verifyCode !== code) {
            return res.json({ success: false, message: "Invalid code" });
        }

        // Kiểm tra mã có hết hạn không
        if (new Date() > user.verifyCodeExpiry) {
            return res.json({ success: false, message: "Code has expired, please request a new one" });
        }

        // Xác thực thành công — xóa mã, set isVerified
        user.isVerified = true;
        user.verifyCode = null;
        user.verifyCodeExpiry = null;
        await user.save();

        res.json({ success: true, message: "Email verified successfully!" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Verification error" });
    }
};

// ── Resend Code ────────────────────────────────────────────────────────────
const resendVerifyCode = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "Account not found" });
        if (user.isVerified) return res.json({ success: false, message: "Email already verified" });

        const code = generateCode();
        user.verifyCode = code;
        user.verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await sendVerifyEmail(email, code);

        res.json({ success: true, message: "New code sent!" });
    } catch (error) {
        console.error("RESEND OTP ERROR:", error);
        res.json({ success: false, message: "Could not send verification code. Please try again later." });
    }
};

// ── Admin functions (giữ nguyên) ───────────────────────────────────────────

const listUsers = async (req, res) => {
    try {
        const users = await userModel
            .find({})
            .select("_id name email role isBlocked createdAt updatedAt")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id, role } = req.body;
        const allowed = ["admin", "staff", "customer"];
        if (!id) return res.json({ success: false, message: "Missing id" });
        if (!allowed.includes(role)) return res.json({ success: false, message: "Invalid role" });
        const updated = await userModel
            .findByIdAndUpdate(id, { role }, { new: true })
            .select("_id name email role isBlocked createdAt updatedAt");
        if (!updated) return res.json({ success: false, message: "User not found" });
        res.json({ success: true, message: "Role updated", data: updated });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const adminCreateUser = async (req, res) => {
    const { name, email, role } = req.body;
    try {
        const allowed = ["admin", "staff", "customer"];

        if (!name || !email) return res.json({ success: false, message: "Missing fields" });
        if (!validator.isEmail(email)) return res.json({ success: false, message: "Please enter a valid email!" });
        if (role && !allowed.includes(role)) return res.json({ success: false, message: "Invalid role" });
        // Kiểm tra email đã tồn tại chưa
        const exists = await userModel.findOne({ email });
        if (exists) return res.json({ success: false, message: "This email has already been used!" });

        // tạo token gốc (plain)
        const inviteToken = randomBytes(32).toString("hex");
        const newUser = new userModel({
            name,
            email,
            role: role || "staff",

            // chưa active
            isVerified: false,
            password: "",

            inviteToken,
            inviteTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
        });

        await newUser.save();

        // link frontend
        const link = `${process.env.FRONTEND_URL}/set-password?token=${inviteToken}`;

        // gửi mail
        try {
            await sendInviteEmail({
                to: email,
                name,
                role,
                link
            });

            // Nếu mail gửi thành công, trả về cho Frontend
            return res.json({
                success: true,
                message: "User created & invite sent"
            });

        } catch (mailError) {
            console.error("❌ LỖI GỬI MAIL INVITE:", mailError);

            // 💡 QUAN TRỌNG: Xóa luôn user vừa tạo để DB không bị kẹt rác, Admin có thể tạo lại
            await userModel.findByIdAndDelete(newUser._id);

            return res.json({
                success: false,
                message: "Failed to send email. Check SMTP setup!"
            });
        }
    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "Server error" });
    }
};

const adminSetBlocked = async (req, res) => {
    try {
        const { id, blocked } = req.body;
        if (!id) return res.json({ success: false, message: "Missing id" });
        const updated = await userModel
            .findByIdAndUpdate(id, { isBlocked: Boolean(blocked) }, { new: true })
            .select("_id name email role isBlocked createdAt updatedAt");
        if (!updated) return res.json({ success: false, message: "User not found" });
        res.json({ success: true, message: "Updated", data: updated });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const adminDeleteUser = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.json({ success: false, message: "Missing id" });
        const deleted = await userModel.findByIdAndDelete(id);
        if (!deleted) return res.json({ success: false, message: "User not found" });
        res.json({ success: true, message: "User deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

const getMe = async (req, res) => {
    try {
        const userId = req.userId || req.body?.userId;
        const user = await userModel.findById(userId).select("_id name email role createdAt updatedAt");
        if (!user) return res.json({ success: false, message: "User not found" });
        res.json({ success: true, data: user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
};

export { loginUser, registerUser, verifyEmail, resendVerifyCode, listUsers, updateUserRole, getMe, adminCreateUser, adminSetBlocked, adminDeleteUser };