
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email is required.' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,         // e.g., 'smtp.gmail.com' for Gmail, 'smtp.sendgrid.net'
      port: parseInt(process.env.MAIL_PORT || '587'), // e.g., 587 for TLS, 465 for SSL
      auth: {
        user: process.env.MAIL_USER,       // Your email address (e.g., your_email@gmail.com)
        pass: process.env.MAIL_PASS,       // Your email password or app-specific password
      },
    });

    try {
      // Send mail to yourself (the site owner)
      await transporter.sendMail({
        from: `"${email}" <${process.env.MAIL_USER}>`, // Sender will appear as the user's email
        to: 'vasuzx890@gmail.com', // Your email address where you want to receive subscriptions
        subject: `New Newsletter Subscription from ${email}`,
        html: `
          <p>You have a new newsletter subscriber!</p>
          <p><strong>Email:</strong> ${email}</p>
          <p>Subscribed on: ${new Date().toLocaleString()}</p>
        `,
      });

      await transporter.sendMail({
        from: `SkillSense.AI <${process.env.MAIL_USER}>`, // Your sending email address
        to: email,
        subject: 'Welcome to SkillSense.AI Newsletter!',
        html: `
          <p>Hi there,</p>
          <p>Thank you for subscribing to the SkillSense.AI newsletter!</p>
          <p>Get ready for exclusive career tips, AI updates, and success stories delivered straight to your inbox.</p>
          <p>Best regards,<br/>The SkillSense.AI Team</p>
        `,
      });


      return res.status(200).json({ message: 'Subscription successful!' });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Failed to send email.', error: (error as Error).message });
    }
  } else {
    // Handle any non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}