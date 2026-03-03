import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ShieldCheck } from 'lucide-react'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSignup = (e) => {
    e.preventDefault()
    setError('')

    const { name, email, password, confirmPassword } = formData

    // Basic Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // Signup Process
    const handleProcess = async () => {
      console.log('Starting signup process for:', email);
      try {
        // 1. Send OTP via backend API
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        console.log('Response status:', response.status);
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);

        if (!response.ok) {
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to send verification code');
          } else {
            const text = await response.text();
            console.error('Non-JSON error response:', text.substring(0, 200));
            // If we are in development, we can try to proceed even if the server returns HTML (e.g. proxy error)
            // But usually this means the backend is down or unreachable.
            throw new Error('Server error (HTML received). Please check if backend is running on port 5000.');
          }
        }

        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error('Expected JSON but got:', text.substring(0, 200));
          throw new Error('Invalid server response format');
        }
        console.log('OTP send response:', data);

        // 2. Store temp user data for final account creation after verification
        const tempUser = { name, email, password };
        localStorage.setItem('tempUser', JSON.stringify(tempUser));

        // 3. Redirect to Email Verification page
        navigate('/email-verification');
      } catch (err) {
        console.error('Signup error:', err);
        setError(err.message || 'Failed to send verification email. Please try again later.');
      }
    };

    handleProcess();
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-section" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div className="logo-icon" style={{ width: '50px', height: '50px' }}>
            <ShieldCheck size={32} />
          </div>
          <span className="logo-text" style={{ fontSize: '28px' }}>BodhAI</span>
        </div>
        
        <h2>Create Account</h2>
        <p className="auth-footer" style={{ marginTop: '-1rem', marginBottom: '2rem' }}>
          Join the AI-powered learning revolution
        </p>

        {error && (
          <div style={{ 
            padding: '12px', 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: 'var(--radius-md)', 
            color: '#f87171', 
            fontSize: '14px', 
            marginBottom: '1.5rem' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} /> Full Name
            </label>
            <input 
              type="text" 
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} /> Email Address
            </label>
            <input 
              type="email" 
              placeholder="yourname@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} /> Password
            </label>
            <input 
              type="password" 
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} /> Confirm Password
            </label>
            <input 
              type="password" 
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="action-btn" style={{ width: '100%', marginTop: '1rem' }}>
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
