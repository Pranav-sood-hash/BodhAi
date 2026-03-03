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
  const [isLoading, setIsLoading] = useState(false)
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

    // Create account directly without email verification
    setIsLoading(true)

    try {
      // Create user object
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        createdAt: new Date().toISOString(),
        role: 'user'
      }

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(newUser))

      // Navigate to avatar selection for customization
      navigate('/avatar-selection')
    } catch (err) {
      console.error('Signup error:', err)
      setError('Failed to create account. Please try again.')
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

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">
          Join the AI-powered learning revolution
        </p>

        {error && (
          <div className="auth-error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label-with-icon">
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
            <label className="form-label-with-icon">
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
            <label className="form-label-with-icon">
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
            <label className="form-label-with-icon">
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

          <button
            type="submit"
            className="action-btn auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
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
