const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sendOTP, verifyOTP } = require('./otpController.cjs');
const { adminLogin } = require('./adminController.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// AI Mentor Mock logic (Node version for preview)
app.post('/api/ai/mentor', (req, res) => {
  const { mode, user_input, context } = req.body;
  
  const userLevel = context?.user_level || 'beginner';
  const currentPage = context?.current_page || 'unknown';
  
  const mockReplies = {
    "learn": `Here is a clear explanation of your concept with examples. As a ${userLevel} learner on the ${currentPage} page, you'll find this easy to grasp...`,
    "code": `I've analyzed your code. The error seems to be related to... Here's how to fix it...`,
    "roadmap": `Based on your goals, here's a step-by-step learning plan designed specifically for you...`,
    "productivity": `Here's a time-based study plan to help you stay focused and productive today...`
  };

  const reply = mockReplies[mode] || "I'm here to help with your learning journey. What would you like to know?";
  
  res.json({
    reply: `Mocked AI Response for ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode: ${reply}`
  });
});

// API Endpoints
app.post('/api/send-otp', sendOTP);
app.post('/api/verify-otp', verifyOTP);
app.post('/api/admin-login', adminLogin);

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
