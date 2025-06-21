"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendForgotPasswordCode = exports.sendResetPasswordConfirmation = exports.sendEmailVerificationSuccess = exports.sendEmailVerificationCode = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});
const FRONTEND_URL = `http://localhost:8000/api/v1/auth`;
const sendEmail = async (options) => {
    await transporter.sendMail({
        from: `"Express Todo" <${process.env.GMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
    });
};
const sendEmailVerificationCode = async (email, code) => {
    await sendEmail({
        to: email,
        subject: 'Your Email Verification Code',
        html: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
    });
};
exports.sendEmailVerificationCode = sendEmailVerificationCode;
const sendEmailVerificationSuccess = async (email) => {
    await sendEmail({
        to: email,
        subject: 'Email Verified',
        html: `<p>Your email has been successfully verified!</p>`,
    });
};
exports.sendEmailVerificationSuccess = sendEmailVerificationSuccess;
const sendResetPasswordConfirmation = async (email) => {
    await sendEmail({
        to: email,
        subject: 'Password Reset Successful',
        html: `<p>Your password has been reset successfully.</p>`,
    });
};
exports.sendResetPasswordConfirmation = sendResetPasswordConfirmation;
const sendForgotPasswordCode = async (email, code) => {
    await sendEmail({
        to: email,
        subject: 'Password Reset Code',
        html: `<p>Your password reset code is <strong>${code}</strong>. It will expire in 5 minutes.</p>`,
    });
};
exports.sendForgotPasswordCode = sendForgotPasswordCode;
//# sourceMappingURL=emails.js.map