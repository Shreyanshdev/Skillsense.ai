
export type EmailTemplateType = 'OTP' | 'VERIFIED' | 'RESET' | 'WELCOME';

export const getEmailTemplate = (
  type: EmailTemplateType,
  data?: string
): string => {
  const styles = {
    base: `font-family:'Segoe UI';color:#1e293b;background:#f1f5f9;padding:40px 20px;text-align:center;`,
    card: `background:white;max-width:500px;margin:auto;border-radius:12px;box-shadow:0 10px 30px rgba(56,182,255,0.3);padding:30px;`,
    logo: `font-size:28px;font-weight:bold;color:#0ea5e9;`,
    heading: `font-size:24px;color:#0ea5e9;margin-bottom:10px;`,
    text: `font-size:16px;color:#334155;margin:10px 0;`,
    token: `font-size:32px;font-weight:bold;background:linear-gradient(to right,#38bdf8,#3b82f6);color:white;padding:10px 20px;border-radius:10px;display:inline-block;margin:20px 0;`,
    footer: `font-size:14px;color:#64748b;margin-top:30px;`,
  };

  const commonHeader = `
    <div style="${styles.logo}">SkillSense<span style="color:#38bdf8;">.AI</span></div>
  `;

  switch (type) {
    case 'OTP':
      return `
        <div style="${styles.base}">
          <div style="${styles.card}">
            ${commonHeader}
            <h2 style="${styles.heading}">Email Verification</h2>
            <p style="${styles.text}">Use the OTP below to verify your email address.</p>
            <div style="${styles.token}">${data}</div>
            <p style="${styles.text}">This OTP will expire in 5 minutes.</p>
            <p style="${styles.footer}">Thank you for using SkillSense.AI!</p>
          </div>
        </div>
      `;
    case 'VERIFIED':
      return `
        <div style="${styles.base}">
          <div style="${styles.card}">
            ${commonHeader}
            <h2 style="${styles.heading}">Email Verification</h2>
            <p style="${styles.text}">Click the link below to verify your email address:</p>
            <p style="${styles.text}"><a href="${process.env.FRONTEND_URL}/verify-email?token=${data}">Verify Email</a></p>
            <p style="${styles.footer}">Thank you for using SkillSense.AI!</p>
          </div>
        </div>
      `;
    case 'RESET':
      return `
        <div style="${styles.base}">
          <div style="${styles.card}">
            ${commonHeader}
            <h2 style="${styles.heading}">Reset Password</h2>
            <p style="${styles.text}">Use the OTP below to reset your password.</p>
            <div style="${styles.token}">${data}</div>
            <p style="${styles.text}">This OTP will expire in 5 minutes.</p>
            <p style="${styles.footer}">Let us know if you didn’t request this.</p>
          </div>
        </div>
      `;
    case 'WELCOME':
      return `
        <div style="${styles.base}">
          <div style="${styles.card}">
            ${commonHeader}
            <h2 style="${styles.heading}">Welcome to SkillSense.AI</h2>
            <p style="${styles.text}">We’re excited to have you onboard!</p>
            <p style="${styles.footer}">Start exploring your career path with us!</p>
          </div>
        </div>
      `;
    default:
      throw new Error(`Unknown email template type: ${type}`);
  }
};
