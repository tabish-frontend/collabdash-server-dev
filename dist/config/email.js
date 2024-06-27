"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.send_email = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const utils_1 = require("../utils");
const send_email = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, subject, html } = options;
    const senderEmail = process.env.SENDER_EMAIL;
    const from = `"${utils_1.TUITION_HIGHWAY}" <${senderEmail}>`;
    // Initialize mail transporter
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    // Define mail options
    const mailOptions = {
        from,
        to,
        subject,
        html, // HTML body
    };
    // Send the email
    yield transporter.sendMail(mailOptions);
});
exports.send_email = send_email;
//# sourceMappingURL=email.js.map