import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Bell, Moon, Sun, Download, Trash2, LogOut, Shield, Mail, Camera } from 'lucide-react'

function Settings() {
  const navigate = useNavigate()
  
  // 1. Account Settings State
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || { name: 'Pranav', email: 'pranav@email.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pranav' })
  const [editMode, setEditMode] = useState(false)
  const [newName, setNewName] = useState(user.name)

  // 2. Change Password State
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState('')

  // 3. Reset Password State
  const [resetEmail, setResetEmail] = useState('')
  const [showResetForm, setShowResetForm] = useState(false)

  // 4. Notification Preferences State
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('userSettings')) || { emailNotifications: true, reminders: true, aiSuggestions: false })

  // 5. Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  // Effect to save user
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user))
  }, [user])

  // Effect to save settings
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings))
  }, [settings])

  // Effect to save theme
  useEffect(() => {
    localStorage.setItem('theme', theme)
    // Applying the class to body for potential light mode styles
    if (theme === 'light') {
      document.body.classList.add('light-mode')
    } else {
      document.body.classList.remove('light-mode')
    }
  }, [theme])

  // Handlers
  const handleUpdateName = (e) => {
    e.preventDefault()
    setUser(prev => ({ ...prev, name: newName }))
    setEditMode(false)
    alert('Name updated successfully')
  }

  const handleChangeAvatar = () => {
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
    setUser(prev => ({ ...prev, avatar: newAvatar }))
    alert('Avatar updated successfully')
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    // Simulate current password check (assuming password is 'password123' if not set)
    const storedPassword = localStorage.getItem('password') || 'password123'
    
    if (passwordData.current !== storedPassword) {
      alert('Current password incorrect')
      return
    }
    if (passwordData.new.length < 8) {
      alert('New password must be at least 8 characters')
      return
    }
    if (passwordData.new !== passwordData.confirm) {
      alert('Passwords do not match')
      return
    }
    
    localStorage.setItem('password', passwordData.new)
    setPasswordMsg('Password updated successfully.')
    setPasswordData({ current: '', new: '', confirm: '' })
    setTimeout(() => setPasswordMsg(''), 3000)
  }

  const handleResetPassword = (e) => {
    e.preventDefault()
    if (!resetEmail) return
    
    const resetToken = Math.random().toString(36).substring(2, 15)
    localStorage.setItem('passwordResetToken', resetToken)
    
    console.log(`Password reset link: http://localhost:5173/reset-password?token=${resetToken}`)
    alert('A password reset link has been generated and logged to the console for simulation.')
    setShowResetForm(false)
    setResetEmail('')
  }

  const handleExportData = () => {
    const data = {
      user: JSON.parse(localStorage.getItem('user')),
      projects: JSON.parse(localStorage.getItem('userProjects')),
      learningProgress: JSON.parse(localStorage.getItem('learningProgress')),
      productivityTasks: JSON.parse(localStorage.getItem('productivityTasks')),
      settings: JSON.parse(localStorage.getItem('userSettings'))
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${user.name.toLowerCase()}_bodhai_data.json`
    a.click()
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear your data? This will remove learning progress, projects, and tasks.')) {
      localStorage.removeItem('learningProgress')
      localStorage.removeItem('userProjects')
      localStorage.removeItem('productivityTasks')
      alert('Your progress and project data has been cleared.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? All your data will be permanently removed.')) {
      localStorage.clear()
      navigate('/signup')
    }
  }

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Settings</h1>
        <p>Customize your account and experience</p>
      </header>

      <div className="cards-grid">
        {/* 1. Account Settings */}
        <div className="dashboard-card gradient-border">
          <div className="card-header">
            <User size={20} />
            <h3>Account Settings</h3>
          </div>
          <div className="card-content">
            <div className="profile-edit-section">
              <div className="avatar-wrapper">
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="settings-avatar"
                />
                <button
                  onClick={handleChangeAvatar}
                  className="change-avatar-btn"
                  title="Change Avatar"
                >
                  <Camera size={14} />
                </button>
              </div>
              <div className="user-details-edit">
                {editMode ? (
                  <form onSubmit={handleUpdateName} className="edit-name-form">
                    <input
                      type="text"
                      className="form-group edit-name-input"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="action-btn save-name-btn">Save</button>
                  </form>
                ) : (
                  <div className="user-name-display">
                    <h4 className="user-name-text">{user.name}</h4>
                    <p className="user-email-text">{user.email}</p>
                    <button
                      onClick={() => setEditMode(true)}
                      className="edit-name-trigger"
                    >
                      Edit Name
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="info-item">
              <label>Email Address</label>
              <p>{user.email}</p>
            </div>
          </div>
        </div>

        {/* 2. Change Password */}
        <div className="dashboard-card">
          <div className="card-header">
            <Lock size={20} />
            <h3>Security</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwordData.current} 
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  placeholder="Minimum 8 characters" 
                  value={passwordData.new} 
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Re-type new password" 
                  value={passwordData.confirm} 
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} 
                  required 
                />
              </div>
              {passwordMsg && <p className="success-message">{passwordMsg}</p>}
              <div className="security-actions">
                <button type="submit" className="action-btn">Update Password</button>
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setShowResetForm(!showResetForm)}
                >
                  Forgot Password?
                </button>
              </div>
            </form>

            {showResetForm && (
              <div className="reset-password-section">
                <h4 className="reset-title">Reset via Email</h4>
                <form onSubmit={handleResetPassword}>
                  <div className="form-group">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="action-btn secondary full-width-btn">
                    <Mail size={16} className="btn-icon" /> Send Reset Link
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* 4. Notification Preferences & 5. Theme Settings */}
        <div className="dashboard-card">
          <div className="card-header">
            <Bell size={20} />
            <h3>Preferences</h3>
          </div>
          <div className="card-content">
            <div className="preferences-list">
              <div className="preference-item">
                <div className="preference-info">
                  <h4 className="preference-title">Email Notifications</h4>
                  <p className="preference-desc">Receive updates about your progress</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => toggleSetting('emailNotifications')}
                  className="preference-checkbox"
                />
              </div>
              <div className="preference-item">
                <div className="preference-info">
                  <h4 className="preference-title">Learning Reminders</h4>
                  <p className="preference-desc">Daily nudges to stay on track</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reminders}
                  onChange={() => toggleSetting('reminders')}
                  className="preference-checkbox"
                />
              </div>
              <div className="preference-item">
                <div className="preference-info">
                  <h4 className="preference-title">AI Mentor Suggestions</h4>
                  <p className="preference-desc">Smart tips based on your behavior</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.aiSuggestions}
                  onChange={() => toggleSetting('aiSuggestions')}
                  className="preference-checkbox"
                />
              </div>
            </div>

            <div className="theme-settings">
              <h4 className="theme-title">Theme Mode</h4>
              <div className="theme-options">
                <button
                  className={`action-btn ${theme === 'dark' ? '' : 'secondary'} theme-btn`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={16} className="btn-icon" /> Dark
                </button>
                <button
                  className={`action-btn ${theme === 'light' ? '' : 'secondary'} theme-btn`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={16} className="btn-icon" /> Light
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Data Management & 7. Account Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <Shield size={20} />
            <h3>Data & Privacy</h3>
          </div>
          <div className="card-content">
            <div className="data-management-section">
              <h4 className="data-title">Export or Clear Data</h4>
              <div className="data-actions">
                <button className="action-btn secondary data-btn" onClick={handleExportData}>
                  <Download size={16} className="btn-icon" /> Export JSON
                </button>
                <button className="action-btn secondary data-btn danger-text" onClick={handleClearData}>
                  <Trash2 size={16} className="btn-icon" /> Clear All
                </button>
              </div>
            </div>

            <div className="account-actions-section">
              <h4 className="account-title">Account Management</h4>
              <div className="account-actions">
                <button className="action-btn logout-btn" onClick={handleLogout}>
                  <LogOut size={16} className="btn-icon" /> Logout
                </button>
                <button className="action-btn delete-btn" onClick={handleDeleteAccount}>
                  <Shield size={16} className="btn-icon" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
