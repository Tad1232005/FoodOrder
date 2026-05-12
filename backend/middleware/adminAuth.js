import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({ success: false, message: "Unauthorized access. Please log in again." });
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(token_decode.id).select("_id role email name");
        if (!user) return res.json({ success: false, message: "User not found" });
        if (user.role !== "admin") return res.json({ success: false, message: "Forbidden" });
        req.admin = user;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Invalid or expired token!" });
    }
};

export default adminAuth;

