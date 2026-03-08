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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Clear previous auth data before logging in
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store data in localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user))
        localStorage.setItem('token', data.data.access_token)
        navigate('/')
      } else {
        setError(data.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to connect to server. Please try again.')
    } finally {
      setIsLoading(false)
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
