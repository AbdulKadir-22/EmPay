const transporter = require('../config/mail');
const env = require('../config/env');
const logger = require('../utils/logger.util');

const from = `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`;

/**
 * Send OTP for password reset
 */
const sendResetOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'EmPay - Password Reset Code',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #714B67 0%, #9b6b8e 100%); padding: 40px 30px; border-radius: 16px 16px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">EmPay</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Password Reset Request</p>
          </div>
          <div style="padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              You requested a password reset. Use the verification code below:
            </p>
            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; text-align: center; border: 2px dashed #714B67;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #714B67;">${otp}</span>
            </div>
            <p style="margin-top: 24px; color: #94a3b8; font-size: 13px; line-height: 1.5;">
              This code expires in <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    logger.error('Failed to send reset OTP email', { error: error.message });
    throw new Error('Failed to send email');
  }
};

/**
 * Send welcome email with temporary password when admin invites a user
 */
const sendWelcomeEmail = async (email, tempPassword, firstName) => {
  const loginUrl = `${env.FRONTEND_URL}/login`;

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Welcome to EmPay — Your Account is Ready',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #714B67 0%, #9b6b8e 100%); padding: 40px 30px; border-radius: 16px 16px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to EmPay 🎉</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Your HR & Payroll Portal</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 8px;">
              Hi <strong>${firstName || 'there'}</strong>,
            </p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
              Your account has been created by your organization's administrator. Here are your login credentials:
            </p>

            <!-- Credentials Box -->
            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Email</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Temp Password</td>
                  <td style="padding: 8px 0;">
                    <code style="background: #714B67; color: #ffffff; padding: 4px 12px; border-radius: 6px; font-size: 15px; font-weight: 700; letter-spacing: 1px;">${tempPassword}</code>
                  </td>
                </tr>
              </table>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #714B67, #9b6b8e); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                Login & Change Password
              </a>
            </div>

            <!-- Warning -->
            <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
                ⚠️ <strong>Important:</strong> This is a temporary password. You will be prompted to change it on your first login. Do not share this email with anyone.
              </p>
            </div>

            <!-- Footer -->
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
              This is an automated email from EmPay. If you didn't expect this, please contact your HR administrator.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    logger.error('Failed to send welcome email', { error: error.message, email });
    // Don't throw — welcome email is non-critical; the user is already created
    console.warn(`⚠️ Welcome email to ${email} failed: ${error.message}`);
  }
};

module.exports = {
  sendResetOTP,
  sendWelcomeEmail,
};
