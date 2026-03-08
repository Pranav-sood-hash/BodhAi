import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, MessageCircle, FolderGit2, CheckCircle2, ArrowRight, Clock, Target, X, Send, Sparkles, Loader2, Activity } from 'lucide-react'

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
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Learner' }
  const navigate = useNavigate()

  // API Data State
  const [learningStats, setLearningStats] = useState(null)
  const [isStatsLoading, setIsStatsLoading] = useState(true)

  // Safe initialization for productivity stats
  const [productivityStats, setProductivityStats] = useState(() => {
    try {
      const saved = localStorage.getItem('bodhai_productivity_stats')
      return saved ? JSON.parse(saved) : { totalTasks: 0, completedTasks: 0, completionRate: 0 }
    } catch {
      return { totalTasks: 0, completedTasks: 0, completionRate: 0 }
    }
  })

  // Safe initialization for projects
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('userProjects')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Safe initialization for activity log
  const [activityLog, setActivityLog] = useState(() => {
    try {
      const saved = localStorage.getItem('bodhai_activity_log')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Fetch learning stats from API
  useEffect(() => {
    const fetchLearningStats = async () => {
      try {
        setIsStatsLoading(true)
        const token = localStorage.getItem('token')
        const res = await fetch('/api/learning/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setLearningStats(data.data)
        }
      } catch (err) {
        console.error('Error fetching learning stats:', err)
      } finally {
        setIsStatsLoading(false)
      }
    }
    fetchLearningStats()
  }, [])

  // Calculate completion rate for dynamic subtitle
  const completionRate = useMemo(() => {
    return productivityStats.completionRate || 0
  }, [productivityStats.completionRate])

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

  // Sync data from localStorage on mount and when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stats = localStorage.getItem('bodhai_productivity_stats')
        if (stats) setProductivityStats(JSON.parse(stats))

        const userProjects = localStorage.getItem('userProjects')
        if (userProjects) setProjects(JSON.parse(userProjects))

        const activity = localStorage.getItem('bodhai_activity_log')
        if (activity) setActivityLog(JSON.parse(activity))
      } catch (e) {
        console.error('Error syncing dashboard data:', e)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dashboardAiHistory', JSON.stringify(history.slice(-3)))
    } catch (e) {
      console.error('Error saving dashboard AI history:', e)
    }
  }, [history])

  // Log activity when data changes
  const logActivity = (type, message) => {
    try {
      const newActivity = {
        type,
        message,
        timestamp: new Date().toISOString()
      }
      const updated = [newActivity, ...activityLog].slice(0, 10) // Keep last 10 activities
      setActivityLog(updated)
      localStorage.setItem('bodhai_activity_log', JSON.stringify(updated))
    } catch (e) {
      console.error('Error logging activity:', e)
    }
  }

  // Dynamic subtitle based on completion rate
  const getDynamicSubtitle = useMemo(() => {
    if (completionRate < 40) {
      return "Let's build momentum today."
    } else if (completionRate <= 70) {
      return "You're making steady progress."
    } else {
      return "You're on fire. Let's level up."
    }
  }, [completionRate])

  // Get current learning track info from API stats
  const currentLearningInfo = useMemo(() => {
    if (isStatsLoading) return { title: 'Loading...', progress: 0, topic: 'Please wait' }
    if (!learningStats || !learningStats.current_roadmap) {
      return { title: 'Start a learning track', progress: 0, topic: 'Visit the Learn page' }
    }
    const roadmap = learningStats.current_roadmap
    const nextTopic = learningStats.recommended_next_lesson
    return { 
      id: roadmap.id,
      title: roadmap.title, 
      progress: roadmap.progress, 
      topic: nextTopic ? `Next: ${nextTopic.title}` : 'Roadmap complete!' 
    }
  }, [learningStats, isStatsLoading])

  // Get latest project
  const latestProject = useMemo(() => {
    if (projects.length === 0) {
      return { projectName: 'No projects yet', stack: 'Start your first project', progress: 0 }
    }
    return projects[0]
  }, [projects])

  const handleAskQuestion = async (e) => {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    setIsLoading(true)
    setError('')
    setResponse('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

      // Log activity
      logActivity('ai_mentor', `Asked: "${question.substring(0, 30)}..."`)

      setQuestion('')
    } catch (err) {
      console.error('Error asking AI mentor:', err)
      setError('AI Mentor is temporarily unavailable.')
    } finally {
      setIsLoading(false)
    }
  }

  const latestReply = history.length > 0 && history[0].reply ? history[0].reply : "Ask me what to learn next."
  const previewText = latestReply.length > 100 ? latestReply.substring(0, 100) + '...' : latestReply

  // Get overdue tasks count
  const overdueTasks = useMemo(() => {
    try {
      const tasks = JSON.parse(localStorage.getItem('productivityTasks')) || []
      const today = new Date().toISOString().split('T')[0]
      return tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length
    } catch {
      return 0
    }
  }, [productivityStats])

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h1>Welcome back, {user.name}!</h1>
        <p>{getDynamicSubtitle}</p>
      </div>

      <div className="cards-grid">
        <DashboardCard title="Continue Learning" icon={Play} className="learning-card" gradient={true}>
          <div className="course-preview">
            <div className="course-image"><span>📚</span></div>
            <div className="course-info">
              <h4>{currentLearningInfo.title}</h4>
              <p>{currentLearningInfo.topic}</p>
              <div className="progress-bar"><div className="progress" style={{width: `${currentLearningInfo.progress}%`}}></div></div>
              <span className="progress-text">{Math.round(currentLearningInfo.progress)}% complete</span>
            </div>
          </div>
          <button 
            className="action-btn" 
            onClick={() => currentLearningInfo.id ? navigate(`/learn/roadmap/${currentLearningInfo.id}`) : navigate('/learn')}
          >
            {currentLearningInfo.id ? 'Continue' : 'Explore Roadmaps'} <ArrowRight size={16} />
          </button>
        </DashboardCard>

        <DashboardCard title="AI Mentor" icon={MessageCircle} className="mentor-card" gradient={true}>
          <div className="mentor-preview">
            <div className="mentor-avatar"><span>🤖</span></div>
            <div className="mentor-info">
              <p className="last-message">"{previewText}"</p>
              <span className="timestamp">{history.length > 0 ? 'Recently' : 'Not asked yet'}</span>
            </div>
          </div>
          <button className="action-btn secondary" onClick={() => setIsModalOpen(true)}>Ask AI Mentor <ArrowRight size={16} /></button>
        </DashboardCard>

        <DashboardCard title="Current Project" icon={FolderGit2} className="project-card">
          <div className="project-info">
            <h4>{latestProject.projectName}</h4>
            <div className="project-meta">
              <span className="tag">{latestProject.stack}</span>
            </div>
            <div className="project-stats">
              <div><Target size={14} /><span>{projects.length} total projects</span></div>
              <div><CheckCircle2 size={14} /><span>{Math.round(latestProject.progress)}% done</span></div>
            </div>
          </div>
          <button className="action-btn" onClick={() => navigate('/projects')}>
            {projects.length > 0 ? 'Open Project' : 'Start First Project'} <ArrowRight size={16} />
          </button>
        </DashboardCard>

        <DashboardCard title="Today's Productivity Plan" icon={CheckCircle2} className="productivity-card">
          <div className="tasks-list">
            <div className="task-item">
              <div className="checkbox"></div>
              <span>Total Tasks: {productivityStats.totalTasks}</span>
            </div>
            <div className="task-item">
              <div className="checkbox checked"></div>
              <span>Completed: {productivityStats.completedTasks}</span>
            </div>
            <div className="task-item">
              <div className="checkbox"></div>
              <span>Pending: {productivityStats.totalTasks - productivityStats.completedTasks}</span>
            </div>
            {overdueTasks > 0 && (
              <div className="task-item" style={{ color: 'var(--accent-purple)' }}>
                <div className="checkbox"></div>
                <span>⚠️ {overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          <div className="plan-progress">
            <span>{productivityStats.completedTasks} of {productivityStats.totalTasks} completed</span>
            <div className="progress-bar small"><div className="progress" style={{width: `${productivityStats.completionRate}%`}}></div></div>
          </div>
        </DashboardCard>
      </div>

      {/* Activity Section */}
      {activityLog.length > 0 && (
        <div className="activity-section" style={{ marginTop: '28px' }}>
          <DashboardCard title="Recent Activity" icon={Activity} className="activity-card">
            <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activityLog.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="activity-item" style={{
                  padding: '12px',
                  background: 'rgba(139, 92, 246, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--accent-purple)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        {activity.type === 'ai_mentor' && '🤖 '}
                        {activity.type === 'task_completed' && '✓ '}
                        {activity.type === 'project_updated' && '📁 '}
                        {activity.type === 'topic_finished' && '📚 '}
                        {activity.message}
                      </p>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(activity.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      )}

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
