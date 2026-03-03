import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, User, Camera, Upload, CheckCircle2, Bot, Code2, Rocket, Brain, Sword, Sparkles } from 'lucide-react'

const avatars = [
  { id: 'robot', icon: Bot, name: 'Robot Explorer', seed: 'robot' },
  { id: 'coder', icon: Code2, name: 'Cyber Coder', seed: 'coder' },
  { id: 'astronaut', icon: Rocket, name: 'Space Cadet', seed: 'astronaut' },
  { id: 'brain', icon: Brain, name: 'Neural Mind', seed: 'brain' },
  { id: 'ninja', icon: Sword, name: 'Cyber Ninja', seed: 'ninja' },
  { id: 'mentor', icon: Sparkles, name: 'AI Mentor', seed: 'mentor' }
]

const AvatarSelection = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const navigate = useNavigate()

  // Verify that a user session exists
  const currentUser = JSON.parse(localStorage.getItem('user'))
  useEffect(() => {
    if (!currentUser) {
      navigate('/signup')
    }
  }, [currentUser, navigate])

  const handleSelectAvatar = (avatar) => {
    setSelectedAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${avatar.seed}`)
    setUploadedImage(null)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result)
        setSelectedAvatar(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCapture = async () => {
    setIsCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
    } catch (err) {
      alert("Camera access denied or unavailable.")
      setIsCameraActive(false)
    }
  }

  const takePhoto = () => {
    const context = canvasRef.current.getContext('2d')
    context.drawImage(videoRef.current, 0, 0, 400, 300)
    const photo = canvasRef.current.toDataURL('image/png')
    setUploadedImage(photo)
    setSelectedAvatar(null)
    stopCamera()
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    }
    setIsCameraActive(false)
  }

  const handleFinalize = () => {
    const finalAvatar = uploadedImage || selectedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`

    // Update user with selected avatar
    const updatedUser = {
      ...currentUser,
      avatar: finalAvatar
    }

    localStorage.setItem('user', JSON.stringify(updatedUser))

    // Navigate to dashboard
    navigate('/')
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="logo-section" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div className="logo-icon" style={{ width: '50px', height: '50px' }}>
            <ShieldCheck size={32} />
          </div>
          <span className="logo-text" style={{ fontSize: '28px' }}>BodhAI</span>
        </div>

        <h2 style={{ textAlign: 'center' }}>Choose Your Avatar</h2>
        <p className="auth-footer" style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '2rem' }}>
          Personalize your learning profile
        </p>

        <div className="avatar-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {avatars.map(av => {
            const Icon = av.icon
            const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${av.seed}`
            return (
              <button 
                key={av.id}
                onClick={() => handleSelectAvatar(av)}
                style={{ 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)', 
                  background: 'rgba(30, 20, 50, 0.4)', 
                  border: selectedAvatar === url ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)', 
                  color: 'white', 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ padding: '12px', background: 'var(--gradient-glow)', borderRadius: '50%', color: 'white' }}>
                  <Icon size={24} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '500' }}>{av.name}</span>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            className="action-btn secondary" 
            style={{ flex: 1, padding: '14px' }}
            onClick={() => fileInputRef.current.click()}
          >
            <Upload size={18} style={{ marginRight: '8px' }} /> Upload Photo
          </button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
          
          <button 
            className="action-btn secondary" 
            style={{ flex: 1, padding: '14px' }}
            onClick={handleCapture}
          >
            <Camera size={18} style={{ marginRight: '8px' }} /> Capture Photo
          </button>
        </div>

        {isCameraActive && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.85)', 
            backdropFilter: 'blur(5px)',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 100 
          }}>
            <video ref={videoRef} autoPlay style={{ width: '400px', borderRadius: '12px', transform: 'scaleX(-1)' }} />
            <canvas ref={canvasRef} width="400" height="300" style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={takePhoto} className="action-btn" style={{ padding: '12px 24px' }}>Capture</button>
              <button onClick={stopCamera} className="action-btn secondary" style={{ padding: '12px 24px' }}>Cancel</button>
            </div>
          </div>
        )}

        {uploadedImage && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-muted)' }}>Selected Photo</h4>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={uploadedImage} alt="Uploaded" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-purple)' }} />
              <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent-purple)', borderRadius: '50%', padding: '2px' }}>
                <CheckCircle2 size={20} color="white" />
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={handleFinalize} 
          className="action-btn" 
          style={{ width: '100%', padding: '16px', fontSize: '16px' }}
          disabled={!selectedAvatar && !uploadedImage}
        >
          Finalize Account
        </button>
      </div>
    </div>
  )
}

export default AvatarSelection
