import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Mail, RotateCcw } from 'lucide-react'

const EmailVerification = () => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const navigate = useNavigate()
  
  // 1. Get temp user data to show email (optional)
  const tempUser = JSON.parse(localStorage.getItem('tempUser'))
  
  useEffect(() => {
    if (!tempUser) {
      navigate('/signup') // Redirect back if no temp user session
    }
  }, [tempUser, navigate])

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempUser.email, otp }),
        signal: controller.signal
      });

      clearTimeout(timeoutId)
      const contentType = response.headers.get('content-type');

      if (response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('OTP verification response:', data);
        }
        setSuccess('Verification successful!')
        setTimeout(() => {
          navigate('/avatar-selection')
        }, 1000)
      } else {
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setError(data.error || 'Invalid code. Please try again.')
        } else {
          const text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 200));
          setError('Server error. Please check your connection.')
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timeout. Please try again.')
      } else {
        setError('Connection to server failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setSuccess('')
    setIsResending(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempUser.email }),
        signal: controller.signal
      });

      clearTimeout(timeoutId)
      const contentType = response.headers.get('content-type');

      if (response.ok) {
        setSuccess('A new verification code has been sent!')
        setTimeout(() => setSuccess(''), 5000)
      } else {
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setError(data.error || 'Failed to resend code.')
        } else {
          setError('Failed to resend code. Server error.')
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timeout. Please try again.')
      } else {
        setError('Connection failed. Please try again.')
      }
    } finally {
      setIsResending(false)
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

        <h2 style={{ textAlign: 'center' }}>Verify Email</h2>
        <p className="auth-footer" style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '2rem' }}>
          Enter the 6-digit code sent to<br />
          <strong style={{ color: 'var(--accent-purple)' }}>{tempUser?.email || 'your email'}</strong>
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

        {success && (
          <div style={{ 
            padding: '12px', 
            background: 'rgba(74, 222, 128, 0.15)', 
            border: '1px solid rgba(74, 222, 128, 0.3)', 
            borderRadius: 'var(--radius-md)', 
            color: '#4ade80', 
            fontSize: '14px', 
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <input 
              type="text" 
              maxLength="6"
              placeholder="0 0 0 0 0 0"
              style={{ 
                fontSize: '28px', 
                textAlign: 'center', 
                letterSpacing: '12px', 
                fontWeight: 'bold',
                padding: '20px'
              }}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              required
            />
          </div>

          <button
            type="submit"
            className="action-btn"
            disabled={isLoading}
            style={{
              width: '100%',
              marginTop: '1rem',
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <button
          onClick={handleResendOtp}
          disabled={isResending}
          style={{
            background: 'none',
            border: 'none',
            color: isResending ? 'rgba(113, 113, 122, 0.5)' : 'var(--text-muted)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '2rem auto 0',
            cursor: isResending ? 'not-allowed' : 'pointer',
            opacity: isResending ? 0.6 : 1
          }}
        >
          <RotateCcw size={16} /> {isResending ? 'Sending...' : 'Resend OTP'}
        </button>
      </div>
    </div>
  )
}

export default EmailVerification
