import dotenv from "dotenv";
dotenv.config();

function getSendGridConfig() {
    const apiKey = process.env.SENDGRID_API_KEY?.trim();
    const from = process.env.SENDGRID_FROM?.trim() || process.env.EMAIL_USER?.trim();
    return { apiKey, from };
}

export async function sendEmail({ to, subject, html }) {
    const { apiKey, from } = getSendGridConfig();

    if (!apiKey) {
        throw new Error("Missing SENDGRID_API_KEY");
    }
    if (!from) {
        throw new Error("Missing SENDGRID_FROM (set it or use EMAIL_USER)");
    }

    const resp = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            personalizations: [
                {
                    to: (Array.isArray(to) ? to : [to]).map((email) => ({ email })),
                    subject,
                },
            ],
            from: { email: from, name: "FoodOrder" },
            content: [{ type: "text/html", value: html }],
        }),
    });

    if (resp.status !== 202) {
        const text = await resp.text().catch(() => "");
        throw new Error(`SendGrid error ${resp.status}: ${text}`);
    }
}
