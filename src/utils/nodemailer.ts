// utils/email/mailSender.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import OTP from '@/models/OTP';
import { getEmailTemplate } from './templates';
import { generateAndStoreToken } from './tokenUtils';
dotenv.config();

export interface MailOptions {
  email: string;
  emailType: 'VERIFIED' | 'RESET' | 'WELCOME';
  userId?: string;
  otp?: string;
}

export const mailSender = async ({ email, emailType, userId, otp }: MailOptions) => {
  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS || !process.env.MAIL_HOST) {
      throw new Error('Missing required mail environment variables');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      socketTimeout: 5000,
      greetingTimeout: 5000,
    });

    let subject = '';
    let html = '';

    switch (emailType) {
      case 'VERIFIED': {
        // If otp is provided, send OTP email; otherwise send token link
        if (otp) {
          subject = 'Your SkillSense.AI OTP Code';
          html = getEmailTemplate('OTP', otp);
        } else {
          if (!userId) throw new Error('User ID is required for email verification');
          const token = await generateAndStoreToken(userId, 'verifyToken');
          subject = 'Verify Your Email Address';
          html = getEmailTemplate('VERIFIED', token);
        }
        break;
      }
      case 'RESET': {
        if (!userId) throw new Error('User ID is required for password reset');

        const resetToken = await generateAndStoreToken(userId, 'resetToken');
        subject = 'Reset Your Password';
        html = getEmailTemplate('RESET', resetToken);
        break;
      }
      case 'WELCOME': {
        subject = 'Welcome to SkillSense.AI';
        html = getEmailTemplate('WELCOME');
        break;
      }
      default: {
        throw new Error(`Unknown email type: ${emailType}`);
      }
    }

    const mailOptions = {
      from: process.env.MAIL_FROM || 'SkillSense.AI <no-reply@skillsense.ai>',
      to: email,
      subject,
      html,
    };

    const mailResponse = await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: 'Email sent successfully',
      info: mailResponse,
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email',
    };
  }
};
