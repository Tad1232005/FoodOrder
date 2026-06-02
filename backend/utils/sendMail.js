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

    if (resp.status !== 202) {
        const text = await resp.text().catch(() => "");
        throw new Error(`SendGrid error ${resp.status}: ${text}`);
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