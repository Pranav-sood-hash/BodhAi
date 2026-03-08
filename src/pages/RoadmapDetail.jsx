import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  MessageCircle, 
  Play, 
  ArrowLeft, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  Sparkles,
  Award
} from 'lucide-react'

function TopicCard({ topic, roadmapId, onToggleComplete, onAskMentor }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`topic-item ${topic.completed ? 'completed' : ''}`}>
      <div className="topic-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="topic-title-wrapper">
          <button 
            className="status-btn" 
            onClick={(e) => {
              e.stopPropagation()
              onToggleComplete(topic.id, !topic.completed)
            }}
          >
            {topic.completed ? <CheckCircle2 size={20} className="text-success" /> : <Circle size={20} />}
          </button>
          <div>
            <h4>{topic.title}</h4>
            <span className="topic-meta"><Clock size={12} /> {topic.estimated_time}</span>
          </div>
        </div>
        <div className="topic-actions">
          <button 
            className="icon-btn" 
            onClick={(e) => {
              e.stopPropagation()
              onAskMentor(topic.title)
            }}
            title="Ask AI Mentor"
          >
            <MessageCircle size={18} />
          </button>
          <button className="icon-btn">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="topic-details">
          <p>{topic.description || "Learn the core concepts of this topic with step-by-step guidance."}</p>
          <div className="topic-buttons">
            <button className="action-btn small">
              <Play size={14} /> Start Lesson
            </button>
            <button 
              className="action-btn small secondary"
              onClick={() => onToggleComplete(topic.id, !topic.completed)}
            >
              {topic.completed ? 'Mark Incomplete' : 'Complete Lesson'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RoadmapDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [roadmap, setRoadmap] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRoadmap = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/learning/roadmap/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setRoadmap(data.data)
      } else {
        setError("Failed to load roadmap. It might not exist.")
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err)
      setError("An error occurred while loading the roadmap.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoadmap()
  }, [id])

  const handleToggleComplete = async (topicId, completed) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/learning/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic_id: topicId, completed })
      })

      if (res.ok) {
        // Update local state
        setRoadmap(prev => {
          const newPhases = prev.phases.map(phase => ({
            ...phase,
            topics: phase.topics.map(topic =>
              topic.id === topicId ? { ...topic, completed } : topic
            )
          }))
          return { ...prev, phases: newPhases }
        })
      }
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  const handleAskMentor = (topicTitle) => {
    window.dispatchEvent(new CustomEvent('ai-mentor-query', {
      detail: { 
        user_input: `Explain ${topicTitle} and how it fits into ${roadmap.title}`, 
        mode: 'learn',
        context: {
          roadmap_topic: topicTitle,
          roadmap_title: roadmap.title
        }
      }
    }))
    // Open the AI panel if it's closed (assuming there's a way to trigger it)
    // For now, the user can manually open it or it might auto-show
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading your roadmap...</p>
      </div>
    )
  }

  if (error || !roadmap) {
    return (
      <div className="error-container">
        <ArrowLeft size={24} onClick={() => navigate('/learn')} style={{ cursor: 'pointer' }} />
        <h3>{error || "Roadmap not found"}</h3>
        <button className="action-btn" onClick={() => navigate('/learn')}>Back to Roadmaps</button>
      </div>
    )
  }

  // Calculate overall progress
  const allTopics = roadmap.phases.flatMap(p => p.topics)
  const completedCount = allTopics.filter(t => t.completed).count
  // Wait, filter doesn't have count property in JS, it's length
  const completedLength = allTopics.filter(t => t.completed).length
  const totalLength = allTopics.length
  const progressPct = totalLength > 0 ? Math.round((completedLength / totalLength) * 100) : 0

  return (
    <div className="page-container roadmap-detail">
      <header className="page-header">
        <button className="back-link" onClick={() => navigate('/learn')}>
          <ArrowLeft size={18} /> Back to Roadmaps
        </button>
        <div className="header-main">
          <div>
            <div className="tag-row">
              <span className="tag">{roadmap.level}</span>
              <span className="tag">{roadmap.track}</span>
            </div>
            <h1>{roadmap.title}</h1>
            <p className="description">{roadmap.description || "Master these skills with your personalized AI learning path."}</p>
          </div>
          <div className="progress-summary">
            <div className="progress-circle">
              <Sparkles size={24} />
              <div className="percentage">{progressPct}%</div>
            </div>
            <span>Overall Progress</span>
          </div>
        </div>
      </header>

      <div className="roadmap-content">
        <div className="phases-list">
          {roadmap.phases.map((phase, index) => (
            <div key={phase.id} className="phase-section">
              <div className="phase-header">
                <div className="phase-number">Phase {index + 1}</div>
                <h3>{phase.title}</h3>
              </div>
              <div className="topics-list">
                {phase.topics.map(topic => (
                  <TopicCard 
                    key={topic.id} 
                    topic={topic} 
                    roadmapId={roadmap.id}
                    onToggleComplete={handleToggleComplete}
                    onAskMentor={handleAskMentor}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="roadmap-sidebar">
          <div className="sidebar-card">
            <h4><Award size={18} /> Capstone Project</h4>
            <p>Apply your skills by building a real-world project at the end of this roadmap.</p>
            <div className="project-preview">
              <h5>Full-Stack Application</h5>
              <p>Deploy a production-ready application using everything you've learned.</p>
            </div>
            <button className="action-btn secondary full-width">View Project Requirements</button>
          </div>

          <div className="sidebar-card mentor-tip">
            <h4>AI Mentor Tip</h4>
            <p>"Focus on understanding the 'why' behind each concept. If you get stuck, I'm here to help!"</p>
            <button className="action-btn full-width" onClick={() => handleAskMentor(roadmap.title)}>
              Discuss Progress with Mentor
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default RoadmapDetail
