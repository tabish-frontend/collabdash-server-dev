import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { TUITION_HIGHWAY } from "../utils";

// Define an interface for email options
interface ISendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export const send_email = async (options: ISendEmailOptions): Promise<void> => {
  const { to, subject, html } = options;

  const senderEmail: string | undefined = process.env.SENDER_EMAIL;

  const from = `"${TUITION_HIGHWAY}" <${senderEmail}>`;

  // Initialize mail transporter
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 2525,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define mail options
  const mailOptions: SendMailOptions = {
    from, // Sender address
    to, // List of receivers
    subject, // Subject line
    html, // HTML body
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};
