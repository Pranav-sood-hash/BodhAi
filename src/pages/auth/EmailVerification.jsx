import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Mail, RotateCcw } from 'lucide-react'

const EmailVerification = () => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  
  // 1. Get temp user data to show email (optional)
  const tempUser = JSON.parse(localStorage.getItem('tempUser'))
  
  useEffect(() => {
    if (!tempUser) {
      navigate('/signup') // Redirect back if no temp user session
    }
  }, [tempUser, navigate])

  const handleVerify = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const storedOtp = localStorage.getItem('verificationOtp')

    if (otp === storedOtp) {
      setSuccess('Verification successful!')
      // Future: Finalize user creation session step
      // Remove OTP from storage but keep temp user for next step
      localStorage.removeItem('verificationOtp')
      
      setTimeout(() => {
        navigate('/avatar-selection')
      }, 1000)
    } else {
      setError('Invalid code. Please try again.')
    }
  }

  const handleResendOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
    localStorage.setItem('verificationOtp', newOtp)
    console.log(`BodhAI NEW OTP Code for ${tempUser?.email}: ${newOtp}`)
    setSuccess('A new verification code has been sent!')
    setError('')
    setTimeout(() => setSuccess(''), 3000)
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

          <button type="submit" className="action-btn" style={{ width: '100%', marginTop: '1rem' }}>
            Verify Code
          </button>
        </form>

        <button 
          onClick={handleResendOtp}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            fontSize: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            margin: '2rem auto 0', 
            cursor: 'pointer' 
          }}
        >
          <RotateCcw size={16} /> Resend OTP
        </button>
      </div>
    </div>
  )
}

export default EmailVerification
