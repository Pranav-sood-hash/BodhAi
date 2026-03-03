const { sendOTPEmail } = require('./emailService.cjs');

// In-memory store for OTPs
// Structure: otpStore[email] = { otp: "123456", expires: timestamp, attempts: 0 }
const otpStore = {};

/**
 * Generates a 6-digit OTP and sends it to the user's email
 * @param {string} email - Recipient email
 */
const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore[email] = {
      otp: generatedOtp,
      expires,
      attempts: 0,
    };

    await sendOTPEmail(email, generatedOtp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    // Development-friendly: log the OTP if email sending fails, so testing can continue
    const logOtp = otpStore[email]?.otp || "N/A";
    console.log(`[DEVELOPMENT ONLY] OTP for ${email}: ${logOtp}`);

    if (error.code === 'EAUTH') {
      return res.status(500).json({
        error: 'Email configuration error. Please ensure you have set valid EMAIL_USER and EMAIL_PASS (Gmail App Password) in your .env file. For development, you can check the server logs for the code.'
      });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Verifies the OTP provided by the user
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const storedData = otpStore[email];

  if (!storedData) {
    return res.status(404).json({ error: 'OTP not found. Please request a new one.' });
  }

  // Check expiration
  if (Date.now() > storedData.expires) {
    delete otpStore[email];
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  // Check attempts
  if (storedData.attempts >= 3) {
    delete otpStore[email];
    return res.status(400).json({ error: 'Maximum attempts reached. Please request a new code.' });
  }

  // Verify OTP
  if (storedData.otp === otp) {
    delete otpStore[email];
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    storedData.attempts += 1;
    res.status(400).json({ error: 'Invalid OTP. Please try again.' });
  }
};

module.exports = { sendOTP, verifyOTP };
