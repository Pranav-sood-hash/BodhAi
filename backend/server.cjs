const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sendOTP, verifyOTP } = require('./otpController.cjs');

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

// API Endpoints
app.post('/api/send-otp', sendOTP);
app.post('/api/verify-otp', verifyOTP);

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
