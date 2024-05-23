"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_email_template_for_temporary_password = void 0;
const contants_1 = require("../contants");
const wrapper_1 = require("./wrapper");
// TEMPORARY PASSWORD TEMPLATE
const get_email_template_for_temporary_password = (username, temporary_password) => {
    return (0, wrapper_1.email_template)(`
      <p><b>Dear ${username},</b></p>
      <p>
        To ensure the security of your ${contants_1.TUITION_HIGHWAY} account, we require a password update. This is necessary whether you are logging in for the first time or have requested a password reset.
      </p>
      <br />
      <p><strong>Temporary Password:</strong> ${temporary_password}</p>
      <br />
      <p>Please follow these steps to set your new password:</p>
      <ol>
        <li>Visit our password reset page at <a href="${process.env.ORIGIN_CLIENT_LIVE}" target="_blank">${process.env.ORIGIN_CLIENT_LIVE}</a>.</li>
        <li>Enter the email address with which you are registered at ${contants_1.TUITION_HIGHWAY}.</li>
        <li>Use the temporary password provided in this email.</li>
        <li>Choose and set your new, personalized password.</li>
        <li>Once your password has been reset, you can log in to the portal using your new credentials.</li>
      </ol>
      <p>If you encounter any issues or require assistance during this process, please do not hesitate to contact our support team. We are here to help!</p>
      <br />
      <p>Thank you for taking this important step to secure your account.</p>
      <br />
      <p>Warm regards,<br /><b>The ${contants_1.TUITION_HIGHWAY} Team</b></p>
    `);
};
exports.get_email_template_for_temporary_password = get_email_template_for_temporary_password;
//# sourceMappingURL=temp-password.js.map