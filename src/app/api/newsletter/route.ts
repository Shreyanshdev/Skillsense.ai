import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = body.email;

  if (!email || !email.includes('@')) {
    return NextResponse.json({ message: 'Valid email is required.' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587'),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    // Send to owner
    await transporter.sendMail({
      from: `"${email}" <${process.env.MAIL_USER}>`,
      to: 'vasuzx890@gmail.com',
      subject: `New Newsletter Subscription from ${email}`,
      html: `
        <p>You have a new newsletter subscriber!</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>Subscribed on: ${new Date().toLocaleString()}</p>
      `,
    });

    // Send welcome to subscriber
    await transporter.sendMail({
      from: `SkillSense.AI <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Welcome to SkillSense.AI Newsletter!',
      html: `
        <p>Hi there,</p>
        <p>Thank you for subscribing to the SkillSense.AI newsletter!</p>
        <p>Get ready for exclusive career tips, AI updates, and success stories delivered straight to your inbox.</p>
        <p>Best regards,<br/>The SkillSense.AI Team</p>
      `,
    });

    return NextResponse.json({ message: 'Subscription successful!' }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { message: 'Failed to send email.', error: error.message },
      { status: 500 }
    );
  }
}
