import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ShieldCheck, ArrowRight, Shield } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const navigate = useNavigate()

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (response.ok) {
        // Store admin data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        navigate('/')
      } else {
        setError(data.error || 'Admin login failed. Please try again.')
      }
    } catch (err) {
      console.error('Admin login error:', err)
      if (err.name === 'AbortError') {
        setError('Request timeout. Please check your connection and try again.')
      } else {
        setError('Unable to connect to server. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleSubmit = (e) => {
    // Clear previous auth data before logging in
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    if (isAdminLogin) {
      handleAdminLogin(e)
    } else {
      handleLogin(e)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-section auth-logo-section">
          <div className="logo-icon auth-logo-icon">
            <ShieldCheck size={32} />
          </div>
          <span className="logo-text auth-logo-text">BodhAI</span>
        </div>

        <div className="login-type-toggle">
          <button
            type="button"
            onClick={() => {
              setIsAdminLogin(false)
              setError('')
            }}
            className={`login-type-btn ${!isAdminLogin ? 'active' : ''}`}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminLogin(true)
              setError('')
            }}
            className={`login-type-btn ${isAdminLogin ? 'active' : ''}`}
          >
            <Shield size={14} className="admin-icon" /> Admin
          </button>
        </div>

        <h2 className="auth-title">
          {isAdminLogin ? 'Admin Login' : 'Welcome Back'}
        </h2>
        <p className="auth-subtitle">
          {isAdminLogin ? 'Access admin dashboard' : 'Your AI-powered learning journey continues'}
        </p>

        {error && (
          <div className="auth-error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label-with-icon">
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
            <label className="form-label-with-icon">
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

          <div className="forgot-password-link">
            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="action-btn auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : isAdminLogin ? 'Admin Sign In' : 'Sign In'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        {!isAdminLogin && (
          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Create Account</Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default Login
