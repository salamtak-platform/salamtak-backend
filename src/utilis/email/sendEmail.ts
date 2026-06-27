import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const getRequiredEnv = (key: string) => {
    const value = process.env[key];

    if (!value) {
        throw new Error(`${key} is required for sending emails.`);
    }

    return value;
};

export const SendEmail = async ({ to, subject, html }: {
    to: string,
    subject: string,
    html: string
}) => {
    const emailHost = getRequiredEnv("HOST");
    const emailPort = Number(process.env.EMAIL_PORT || 465);
    const emailUser = getRequiredEnv("EMAIL_USER");
    const emailPassword = getRequiredEnv("EMAIL_PASSWORD");

    const transportOptions: SMTPTransport.Options = {
        host: emailHost,
        port: emailPort,
        secure: process.env.EMAIL_SECURE
            ? process.env.EMAIL_SECURE === "true"
            : emailPort === 465,
        auth: {
            user: emailUser,
            pass: emailPassword
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        tls: {
            servername: emailHost
        }
    };

    const transporter = nodemailer.createTransport(transportOptions);

    console.log("1 - before sending");
    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `Salamtk App <${emailUser}>`,
        to,
        subject,
        html
    });

    console.log("2 - after sending");
    console.log(info);

    return info;
};
