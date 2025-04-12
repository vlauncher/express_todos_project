import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_PASS!,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const FRONTEND_URL = `http://localhost:8000/api/v1/auth`;


const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: `"Express Todo" <${process.env.GMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export const sendEmailVerification = async (email: string, token: string): Promise<void> => {
  const verifyUrl = `${FRONTEND_URL}/verify-email/${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    html: `<p>Thanks for creating an account! To complete your registration, please verify your email address by clicking <a href="${verifyUrl}">this link</a>.</p>`,
  });
}

export const sendEmailVerificationSuccess = async (email: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Email Verified',
    html: `<p>Your email has been successfully verified!</p>`,
  });
}


export const sendResetPasswordConfirmation = async (email: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Password Reset Successful',
    html: `<p>Your password has been reset successfully.</p>`,
  })
}

export const sendForgotPasswordCode = async (email: string, code: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Password Reset Code',
    html: `<p>Your password reset code is <strong>${code}</strong>. It will expire in 5 minutes.</p>`,
  })
}