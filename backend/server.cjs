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

// Admin Middleware
const adminGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  // Simple token validation for mock server
  if (!token.startsWith('admin-token-')) {
    return res.status(403).json({ status: 'error', message: 'Admin access required' });
  }
  next();
};

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

// Admin Routes
app.get('/api/admin/users', adminGuard, (req, res) => {
  const users = [
    { id: 'admin-001', first_name: 'Admin', last_name: 'User', email: 'admin@bodhai.com', role: 'admin', created_at: new Date().toISOString() },
    { id: 'user-001', first_name: 'John', last_name: 'Doe', email: 'john@example.com', role: 'user', created_at: new Date().toISOString() },
    { id: 'user-002', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', role: 'user', created_at: new Date().toISOString() }
  ];
  res.json({ status: 'success', data: users });
});

app.get('/api/admin/projects', adminGuard, (req, res) => {
  const projects = [
    { id: 'proj-001', title: 'AI Study Helper', user_email: 'john@example.com', created_at: new Date().toISOString() },
    { id: 'proj-002', title: 'Python Learning Path', user_email: 'jane@example.com', created_at: new Date().toISOString() }
  ];
  res.json({ status: 'success', data: projects });
});

app.get('/api/admin/analytics', adminGuard, (req, res) => {
  const analytics = {
    total_users: 120,
    active_users: 48,
    total_projects: 75,
    ai_requests_today: 630
  };
  res.json({ status: 'success', data: analytics });
});

app.delete('/api/admin/user/:id', adminGuard, (req, res) => {
  res.json({ status: 'success', message: 'User deleted' });
});

app.delete('/api/admin/project/:id', adminGuard, (req, res) => {
  res.json({ status: 'success', message: 'Project deleted' });
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
