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
        localStorage.setItem('adminToken', data.token)
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
    if (isAdminLogin) {
      handleAdminLogin(e)
    } else {
      handleLogin(e)
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

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => {
              setIsAdminLogin(false)
              setError('')
            }}
            className={`login-type-btn ${!isAdminLogin ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s',
              background: !isAdminLogin ? 'var(--accent-purple)' : '#e5e7eb',
              color: !isAdminLogin ? 'white' : '#374151'
            }}
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
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s',
              background: isAdminLogin ? 'var(--accent-purple)' : '#e5e7eb',
              color: isAdminLogin ? 'white' : '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Shield size={14} /> Admin
          </button>
        </div>

        <h2 style={{ textAlign: 'center' }}>
          {isAdminLogin ? 'Admin Login' : 'Welcome Back'}
        </h2>
        <p className="auth-footer" style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '2rem' }}>
          {isAdminLogin ? 'Access admin dashboard' : 'Your AI-powered learning journey continues'}
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

        <form onSubmit={handleSubmit}>
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

          <button
            type="submit"
            className="action-btn"
            disabled={isLoading}
            style={{
              width: '100%',
              marginTop: '1rem',
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
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
