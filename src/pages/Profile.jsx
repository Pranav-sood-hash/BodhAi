import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Camera, Edit2, Check, X, LogOut } from 'lucide-react'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')))
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(user?.name || '')

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleUpdateName = () => {
    const updatedUser = { ...user, name: tempName }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setIsEditing(false)
  }

  const handleChangeAvatar = () => {
    // Navigate to avatar selection to reuse the logic
    // We store tempUser so it knows what to update
    localStorage.setItem('tempUser', JSON.stringify(user))
    navigate('/avatar-selection')
  }

  if (!user) return null

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings and preferences</p>
      </header>

      <div className="page-content" style={{ display: 'flex', gap: '2rem' }}>
        {/* Left Section: Avatar */}
        <div className="profile-info" style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <img 
              src={user.avatar} 
              alt="Profile" 
              style={{ 
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                objectFit: 'cover', 
                border: '4px solid var(--accent-purple)',
                padding: '4px',
                background: 'var(--bg-secondary)'
              }} 
            />
            <button 
              onClick={handleChangeAvatar}
              style={{ 
                position: 'absolute', 
                bottom: '8px', 
                right: '8px', 
                background: 'var(--gradient-primary)', 
                border: 'none', 
                borderRadius: '50%', 
                width: '40px', 
                height: '40px', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Camera size={20} />
            </button>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{user.name}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{user.email}</p>
          <button onClick={handleLogout} className="action-btn secondary" style={{ width: '100%' }}>
            <LogOut size={18} style={{ marginRight: '8px' }} /> Sign Out
          </button>
        </div>

        {/* Right Section: Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="dashboard-card" style={{ padding: '24px' }}>
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <User size={20} />
              <h3>Personal Information</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="info-item">
                <label>Full Name</label>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <input 
                      type="text" 
                      className="form-group" 
                      style={{ marginBottom: 0, padding: '10px 16px' }} 
                      value={tempName} 
                      onChange={(e) => setTempName(e.target.value)} 
                    />
                    <button onClick={handleUpdateName} className="action-btn" style={{ padding: '10px 16px' }}>
                      <Check size={18} />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="action-btn secondary" style={{ padding: '10px 16px' }}>
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <p style={{ fontSize: '18px', fontWeight: '500' }}>{user.name}</p>
                    <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', cursor: 'pointer' }}>
                      <Edit2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="info-item">
                <label>Email Address</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <Mail size={18} color="var(--text-muted)" />
                  <p style={{ fontSize: '18px', fontWeight: '500' }}>{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
