const nodemailer = require('nodemailer');
require('dotenv').config();

// SMTP configuration for Gmail
// For production with AWS SES, this transporter would be replaced with the AWS SDK
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an OTP email to the user
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"BodhAI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'BodhAI Email Verification Code',
    text: `Your BodhAI verification code is: ${otp}\nThis code will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">BodhAI Verification</h2>
        <p>Hello,</p>
        <p>Your BodhAI verification code is:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #1e293b; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 30px; text-align: center;">
          © 2026 BodhAI Learning Platform. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

module.exports = { sendOTPEmail };
