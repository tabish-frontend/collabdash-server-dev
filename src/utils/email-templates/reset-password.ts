import { TUITION_HIGHWAY } from "../contants";
import { email_template } from "./wrapper";

// RE-SET PASSWORD TEMPLATE
export const get_email_template_for_reset_password = (
  username: string,
  resetURL: string
) => {
  return email_template(`
      <p><b>Dear ${username},</b></p>
      <p>It looks like you need to reset your password. No worries, we've got you covered!</p>
      <p>To reset your password, please follow these steps:</p>
      <ol>
        <li>Click the button below to access the password reset page.</li>
        <li>Choose and set your new password.</li>
        <li>
          Once your password has been reset, log in to the portal using your new credentials.
        </li>
      </ol>
      <p>The link will expire in 24 hours for security reasons, so please be sure to reset your password promptly.</p>
      <p>If you did not request a password reset or if you need further assistance, please contact our support team immediately.</p>
      <a href="${resetURL}">Click here to reset your password</a>
      <p>We're here to help you get back on track quickly and securely!</p>
      <p>Best wishes,<br /><b>The ${TUITION_HIGHWAY} Team</b></p>
    `);
};
