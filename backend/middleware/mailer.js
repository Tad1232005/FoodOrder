import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

// Tạo transporter dùng Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Gửi mã xác thực 6 số
export const sendVerifyEmail = async (toEmail, code) => {
    await transporter.sendMail({
        from: `"FoodOrder" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your verification code",
        html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px">
        <h2 style="color:#ff6347;margin-bottom:8px">FoodOrder</h2>
        <p style="color:#444">Your verification code is:</p>
        <div style="font-size:36px;font-weight:800;letter-spacing:10px;color:#1a1a1a;margin:16px 0">${code}</div>
        <p style="color:#888;font-size:13px">This code expires in <b>10 minutes</b>. Do not share it with anyone.</p>
        </div>
    `,
    });
};

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Mail server ready");
    }
}); 