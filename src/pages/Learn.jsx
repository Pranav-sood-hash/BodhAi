import React, { useState, useEffect } from 'react'
import { Play, BookOpen, Clock, Target, ArrowRight } from 'lucide-react'

function RoadmapCard({ title, difficulty, estimated_time, progress, onStart, id }) {
  return (
    <div className="dashboard-card gradient-border">
      <div className="card-header">
        <BookOpen size={20} />
        <h3>{title}</h3>
      </div>
      <div className="card-content">
        <div className="course-info">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <span className="tag">{difficulty}</span>
            <span className="tag"><Clock size={12} style={{ marginRight: '4px' }} />{estimated_time}</span>
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

function Learn() {
  const [learningProgress, setLearningProgress] = useState(() => {
    const saved = localStorage.getItem('learningProgress')
    return saved ? JSON.parse(saved) : {
      'python_basics': 0,
      'react_mastery': 0,
      'ai_fundamentals': 0,
      'data_science_intro': 0
    }
  })

  useEffect(() => {
    localStorage.setItem('learningProgress', JSON.stringify(learningProgress))
  }, [learningProgress])

  const roadmaps = [
    { id: 'python_basics', title: 'Python Fundamentals', difficulty: 'Beginner', estimated_time: '12h' },
    { id: 'react_mastery', title: 'Modern React Development', difficulty: 'Intermediate', estimated_time: '24h' },
    { id: 'ai_fundamentals', title: 'AI & Machine Learning', difficulty: 'Advanced', estimated_time: '40h' },
    { id: 'data_science_intro', title: 'Data Science with Python', difficulty: 'Intermediate', estimated_time: '30h' }
  ]

  const handleStart = (id) => {
    setLearningProgress(prev => {
      const currentProgress = prev[id] || 0
      // Increment progress by 10% for simulation, max 100%
      const newProgress = Math.min(currentProgress + 10, 100)
      return { ...prev, [id]: newProgress }
    })
  }

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Learning Roadmaps</h1>
          <p>Explore AI-powered learning paths tailored for you</p>
        </div>
        <button className="action-btn secondary" onClick={() => {
          const input = prompt('What would you like to learn? (e.g., Python for Data Science, Advanced React)')
          if (input) {
            window.dispatchEvent(new CustomEvent('ai-mentor-query', {
              detail: { user_input: input, mode: 'roadmap' }
            }))
          }
        }}>
          <Target size={18} style={{ marginRight: '8px' }} /> Generate Custom Roadmap
        </button>
      </header>
      <div className="cards-grid">
        {roadmaps.map(roadmap => (
          <RoadmapCard 
            key={roadmap.id}
            id={roadmap.id}
            {...roadmap}
            progress={learningProgress[roadmap.id] || 0}
            onStart={handleStart}
          />
        ))}
      </div>
    </div>
  )
}

export default Learn
