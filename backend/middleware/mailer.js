import dotenv from "dotenv";
dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM;

async function sendEmail({ to, subject, html }) {
    if (!SENDGRID_API_KEY) {
        throw new Error("Missing SENDGRID_API_KEY");
    }
    if (!SENDGRID_FROM) {
        throw new Error("Missing SENDGRID_FROM");
    }

    const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            personalizations: [
                {
                    to: (Array.isArray(to) ? to : [to]).map((email) => ({ email })),
                    subject,
                },
            ],
            from: { email: SENDGRID_FROM, name: "FoodOrder" },
            content: [{ type: "text/html", value: html }],
        }),
    });

    // SendGrid returns 202 Accepted on success
    if (resp.status !== 202) {
        const text = await resp.text().catch(() => "");
        throw new Error(`SendGrid error ${resp.status}: ${text}`);
    }
}

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

// Không verify ngay lúc startup để tránh deploy bị chậm/treo vì DNS/SMTP