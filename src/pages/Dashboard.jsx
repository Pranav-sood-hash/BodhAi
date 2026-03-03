import React, { useState, useEffect } from 'react'
import { Play, MessageCircle, FolderGit2, CheckCircle2, ArrowRight, Clock, Target, X, Send, Sparkles, Loader2 } from 'lucide-react'

function DashboardCard({ title, icon: Icon, children, className = '', gradient = false }) {
  return (
    <div className={`dashboard-card ${className} ${gradient ? 'gradient-border' : ''}`}>
      <div className="card-header">
        <Icon size={20} />
        <h3>{title}</h3>
      </div>
      <div className="card-content">{children}</div>
    </div>
  )
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Pranav' }

  // AI Mentor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // History State
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('dashboardAiHistory')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('Error parsing dashboard AI history:', e)
      return []
    }
  })

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dashboardAiHistory', JSON.stringify(history.slice(-3)))
    } catch (e) {
      console.error('Error saving dashboard AI history:', e)
    }
  }, [history])

  const handleAskQuestion = async (e) => {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    setIsLoading(true)
    setError('')
    setResponse('')

    try {
      const res = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: "learn",
          user_input: question,
          context: {
            current_page: "dashboard",
            user_level: "intermediate"
          }
        })
      })

      if (!res.ok) throw new Error('API request failed')

      const data = await res.json()
      const newResponse = data.reply

      setResponse(newResponse)

      // Update history: keep only last 3 interactions
      const newInteraction = { question, reply: newResponse }
      setHistory(prev => [newInteraction, ...prev].slice(0, 3))

      setQuestion('')
    } catch (err) {
      console.error('Error asking AI mentor:', err)
      setError('AI Mentor is temporarily unavailable.')
    } finally {
      setIsLoading(false)
    }
  }

  const latestReply = history.length > 0 && history[0].reply ? history[0].reply : "Let me explain recursion with a simple example..."
  const previewText = latestReply.length > 80 ? latestReply.substring(0, 80) + '...' : latestReply

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1>Welcome back, {user.name}!</h1>
        <p>Ready to continue your learning journey?</p>
      </div>

      <div className="cards-grid">
        <DashboardCard title="Continue Learning" icon={Play} className="learning-card" gradient={true}>
          <div className="course-preview">
            <div className="course-image"><span>🐍</span></div>
            <div className="course-info">
              <h4>Advanced Python</h4>
              <p>Module 4: Decorators & Generators</p>
              <div className="progress-bar"><div className="progress" style={{width: '65%'}}></div></div>
              <span className="progress-text">65% complete</span>
            </div>
          </div>
          <button className="action-btn">Continue <ArrowRight size={16} /></button>
        </DashboardCard>

        <DashboardCard title="AI Mentor" icon={MessageCircle} className="mentor-card" gradient={true}>
          <div className="mentor-preview">
            <div className="mentor-avatar"><span>🤖</span></div>
            <div className="mentor-info">
              <p className="last-message">"{previewText}"</p>
              <span className="timestamp">Recently</span>
            </div>
          </div>
          <button className="action-btn secondary" onClick={() => setIsModalOpen(true)}>Ask a Question <ArrowRight size={16} /></button>
        </DashboardCard>

        <DashboardCard title="Current Project" icon={FolderGit2} className="project-card">
          <div className="project-info">
            <h4>E-Commerce API</h4>
            <div className="project-meta">
              <span className="tag">Flask</span>
              <span className="tag">MongoDB</span>
            </div>
            <div className="project-stats">
              <div><Clock size={14} /><span>12h spent</span></div>
              <div><Target size={14} /><span>3/8 tasks</span></div>
            </div>
          </div>
          <button className="action-btn">Open Project <ArrowRight size={16} /></button>
        </DashboardCard>

        <DashboardCard title="Today's Productivity Plan" icon={CheckCircle2} className="productivity-card">
          <div className="tasks-list">
            {[
              { text: 'Complete Python lesson', done: true },
              { text: 'Review project code', done: true },
              { text: 'Build API endpoints', done: false },
              { text: 'Study for 30 mins', done: false },
            ].map((task, i) => (
              <div key={i} className={`task-item ${task.done ? 'done' : ''}`}>
                <div className={`checkbox ${task.done ? 'checked' : ''}`}></div>
                <span>{task.text}</span>
              </div>
            ))}
          </div>
          <div className="plan-progress">
            <span>2 of 4 completed</span>
            <div className="progress-bar small"><div className="progress" style={{width: '50%'}}></div></div>
          </div>
        </DashboardCard>
      </div>

      {/* AI Mentor Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content auth-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="ai-title">
                <div className="ai-avatar"><Sparkles size={16} /></div>
                <h3>Ask AI Mentor</h3>
              </div>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>

            <div className="modal-body">
              {response && (
                <div className="ai-response-container">
                  <div className="message assistant">
                    <div className="message-bubble">{response}</div>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              {isLoading && (
                <div className="loading-container">
                  <Loader2 className="animate-spin" size={24} />
                  <span>Thinking...</span>
                </div>
              )}
            </div>

            <form className="modal-footer" onSubmit={handleAskQuestion}>
              <div className="input-container">
                <input
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Ask anything about your learning..."
                  autoFocus
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`send-btn ${question.trim() && !isLoading ? 'active' : ''}`}
                  disabled={!question.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
