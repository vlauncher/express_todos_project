import dotenv from 'dotenv';
import emailQueue from './queue';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const FRONTEND_URL = `http://localhost:8000/api/v1/auth`;

// Enqueue email job instead of sending directly
const sendEmail = async (options: EmailOptions): Promise<void> => {
  await emailQueue.add('send-email', {
    from: `"Express Todo" <${process.env.GMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const sendEmailVerificationCode = async (email: string, code: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Your Email Verification Code',
    html: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
  });
};

export const sendEmailVerificationSuccess = async (email: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Email Verified',
    html: `<p>Your email has been successfully verified!</p>`,
  });
};

export const sendResetPasswordConfirmation = async (email: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Password Reset Successful',
    html: `<p>Your password has been reset successfully.</p>`,
  });
};

export const sendForgotPasswordCode = async (email: string, code: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Password Reset Code',
    html: `<p>Your password reset code is <strong>${code}</strong>. It will expire in 5 minutes.</p>`,
  });
};