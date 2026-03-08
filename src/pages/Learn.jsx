import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, Target, ArrowRight, Plus, X, Sparkles, Loader2 } from 'lucide-react'

function RoadmapCard({ title, level, duration, progress, onStart, id }) {
  return (
    <div className="dashboard-card gradient-border">
      <div className="card-header">
        <BookOpen size={20} />
        <h3>{title}</h3>
      </div>
      <div className="card-content">
        <div className="course-info">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <span className="tag">{level}</span>
            <span className="tag"><Clock size={12} style={{ marginRight: '4px' }} />{duration}</span>
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{progress}% complete</span>
        </div>
        <button className="action-btn" onClick={() => onStart(id)}>
          {progress > 0 ? 'Continue' : 'Start Learning'} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

function RoadmapModal({ isOpen, onClose, onGenerate }) {
  const [formData, setFormData] = useState({
    goal: '',
    level: 'beginner',
    technology: '',
    timeline: '3 months'
  })
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsGenerating(true)
    await onGenerate(formData)
    setIsGenerating(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="ai-title">
            <div className="ai-avatar"><Sparkles size={16} /></div>
            <h3>Generate Custom Roadmap</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Learning Goal</label>
            <input 
              type="text" 
              placeholder="e.g., Become a backend developer"
              value={formData.goal}
              onChange={e => setFormData({...formData, goal: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Skill Level</label>
            <select 
              value={formData.level}
              onChange={e => setFormData({...formData, level: e.target.value})}
              className="form-select"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Preferred Technology</label>
            <input 
              type="text" 
              placeholder="e.g., Python, React, AI"
              value={formData.technology}
              onChange={e => setFormData({...formData, technology: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Time Commitment</label>
            <select 
              value={formData.timeline}
              onChange={e => setFormData({...formData, timeline: e.target.value})}
              className="form-select"
            >
              <option value="1 month">1 Month</option>
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
            </select>
          </div>
          <button type="submit" className="action-btn" disabled={isGenerating} style={{ width: '100%', marginTop: '20px' }}>
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} />
                AI is designing your path...
              </>
            ) : (
              <>
                <Target size={18} style={{ marginRight: '8px' }} />
                Generate Roadmap
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

function Learn() {
  const [roadmaps, setRoadmaps] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/learning/roadmaps', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setRoadmaps(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching roadmaps:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoadmaps()
  }, [])

  const handleStart = (id) => {
    navigate(`/learn/roadmap/${id}`)
  }

  const handleGenerate = async (formData) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/learning/roadmaps/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const data = await res.json()
        setIsModalOpen(false)
        navigate(`/learn/roadmap/${data.data.id}`)
      }
    } catch (err) {
      console.error('Error generating roadmap:', err)
    }
  }

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Learning Roadmaps</h1>
          <p>Explore AI-powered learning paths tailored for you</p>
        </div>
        <button className="action-btn secondary" onClick={() => setIsModalOpen(true)}>
          <Target size={18} style={{ marginRight: '8px' }} /> Generate Custom Roadmap
        </button>
      </header>
      
      {isLoading ? (
        <div className="loading-container" style={{ minHeight: '300px' }}>
          <Loader2 className="animate-spin" size={32} />
          <p>Loading your learning paths...</p>
        </div>
      ) : (
        <div className="cards-grid">
          {roadmaps.length > 0 ? (
            roadmaps.map(roadmap => (
              <RoadmapCard 
                key={roadmap.id}
                id={roadmap.id}
                {...roadmap}
                onStart={handleStart}
              />
            ))
          ) : (
            <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '20px' }} />
              <h3>No roadmaps found</h3>
              <p>Generate a custom roadmap to start your learning journey!</p>
              <button className="action-btn" onClick={() => setIsModalOpen(true)} style={{ marginTop: '20px' }}>
                <Plus size={18} /> Create Your First Roadmap
              </button>
            </div>
          )}
        </div>
      )}

      <RoadmapModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onGenerate={handleGenerate}
      />
    </div>
  )
}

export default Learn
