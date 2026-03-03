import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    // 1. Get user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'))

    // 2. Mock credentials check (Future Integration: AWS Cognito authenticate)
    if (storedUser && email === storedUser.email && password === storedUser.password) {
      // Login Success: Session already managed by having 'user' in localStorage
      // In a real app, this would be a JWT token or session cookie from AWS Cognito
      navigate('/')
    } else {
      setError('Invalid email or password. Please try again.')
    }
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

        <h2 style={{ textAlign: 'center' }}>Welcome Back</h2>
        <p className="auth-footer" style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '2rem' }}>
          Your AI-powered learning journey continues
        </p>

        {error && (
          <div style={{ 
            padding: '12px', 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: 'var(--radius-md)', 
            color: '#f87171', 
            fontSize: '14px', 
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} /> Email Address
            </label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} /> Password
            </label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--accent-purple)', fontSize: '12px', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="action-btn" style={{ width: '100%', marginTop: '1rem', display: 'flex', gap: '8px' }}>
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create Account</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
