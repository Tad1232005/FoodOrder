import dotenv from "dotenv";
dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "onboarding@resend.dev";

async function sendEmail({ to, subject, html }) {
    if (!RESEND_API_KEY) {
        throw new Error("Missing RESEND_API_KEY");
    }

    const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: RESEND_FROM,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        }),
    });

    if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Resend error ${resp.status}: ${text}`);
    }
}

export const sendInviteEmail = async ({ to, name, role, link }) => {
    await sendEmail({
        to,
        subject: "Invitation to join system",
        html: `
            <h2>Hello ${name}</h2>
            <p>You are invited as <b>${role}</b></p>
            <p>Click below to set password:</p>
            <a href="${link}">Set Password</a>
        `
    });
};