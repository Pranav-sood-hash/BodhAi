/**
 * Admin Authentication Controller
 * Handles admin login with email and password
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bodhai.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

/**
 * Authenticates admin with email and password
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 */
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Compare credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Login successful
      const adminData = {
        id: 'admin-001',
        email: email,
        role: 'admin',
        name: 'Administrator',
        loginTime: new Date().toISOString()
      };

      // Return admin token/session
      res.status(200).json({
        message: 'Admin login successful',
        user: adminData,
        token: `admin-token-${Date.now()}` // Simple token for demo
      });
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { adminLogin };
