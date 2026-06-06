import { sendEmail } from "./emailSender.js";

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
