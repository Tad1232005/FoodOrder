import { sendEmail } from "../utils/emailSender.js";

// Gửi mã xác thực 6 số
export const sendVerifyEmail = async (toEmail, code) => {
    await sendEmail({
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
