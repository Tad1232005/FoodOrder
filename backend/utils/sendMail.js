import nodemailer from "nodemailer";



export const sendInviteEmail = async ({ to, name, role, link }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
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