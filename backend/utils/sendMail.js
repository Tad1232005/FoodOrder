import nodemailer from "nodemailer";

export const sendInviteEmail = async ({ to, name, role, link }) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,         // Cổng bảo mật SMTP của Google
        secure: true,      // Bắt buộc là true khi dùng port 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        // Thêm dòng này để tránh bị một số môi trường (hoặc antivirus ở local) chặn chứng chỉ
        tls: {
            rejectUnauthorized: false
        },
        family: 4
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