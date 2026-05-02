const resend = require('../config/mail');
const logger = require('../utils/logger.util');

/**
 * Send OTP for password reset
 */
const sendResetOTP = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'EmPay <onboarding@resend.dev>', // Use a verified domain in production
      to: [email],
      subject: 'EmPay - Password Reset Code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #714B67;">EmPay Password Reset</h2>
          <p>You requested a password reset. Use the code below to proceed:</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #714B67;">
            ${otp}
          </div>
          <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
            This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      logger.error('Failed to send reset OTP email', { error });
      throw new Error('Failed to send email');
    }

    return data;
  } catch (error) {
    logger.error('Mail Service Error:', error);
    throw error;
  }
};

module.exports = {
  sendResetOTP,
};
