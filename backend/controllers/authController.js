import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const setPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const user = await userModel.findOne({
            inviteToken: token,
            inviteTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.json({
                success: false,
                message: "Invalid or expired invite link"
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        user.password = hashed;
        user.isVerified = true;
        user.inviteToken = null;
        user.inviteTokenExpiry = null;

        await user.save();

        return res.json({
            success: true,
            message: "Password set successfully"
        });

    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: "Server error" });
    }
};