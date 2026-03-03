import React, { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, Circle, Trash2, CalendarCheck, Clock, Plus, Target, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

function ProductivityPlanner() {
  const { addNotification } = useNotifications()
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('productivityTasks')
    const initialTasks = saved ? JSON.parse(saved) : [
      { id: 1, taskTitle: "Complete React fundamentals", dueDate: "2026-03-10", priority: "High", completed: false },
      { id: 2, taskTitle: "Build first AI project", dueDate: "2026-03-15", priority: "Medium", completed: true }
    ]

    // Ensure backward compatibility and initialize defaults
    return initialTasks.map(task => ({
      ...task,
      createdAt: task.createdAt || new Date().toISOString(),
      relatedTopic: task.relatedTopic || 'General',
      estimatedTimeMinutes: task.estimatedTimeMinutes || 30
    }))
  })

  const [newTask, setNewTask] = useState({
    taskTitle: '',
    dueDate: '',
    priority: 'Medium',
    relatedTopic: 'General',
    estimatedTimeMinutes: 30
  })
  const [showForm, setShowForm] = useState(false)
  const [aiPlan, setAiPlan] = useState(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Calculate and store metrics
  const calculateMetrics = useCallback((currentTasks) => {
    const totalTasks = currentTasks.length
    const completedTasks = currentTasks.filter(t => t.completed).length
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const completedWithTime = currentTasks.filter(t => t.completed && t.estimatedTimeMinutes)
    const averageCompletionTime = completedWithTime.length > 0
      ? completedWithTime.reduce((acc, t) => acc + t.estimatedTimeMinutes, 0) / completedWithTime.length
      : 0

    const pendingHighPriorityTasks = currentTasks.filter(t => !t.completed && t.priority === 'High').length

    const stats = {
      totalTasks,
      completedTasks,
      completionRate,
      averageCompletionTime,
      pendingHighPriorityTasks,
      lastUpdated: new Date().toISOString()
    }

    localStorage.setItem('bodhai_productivity_stats', JSON.stringify(stats))
    return stats
  }, [])

  const [lastOverdueCount, setLastOverdueCount] = useState(0)

  useEffect(() => {
    localStorage.setItem('productivityTasks', JSON.stringify(tasks))
    calculateMetrics(tasks)

    // Check for overdue tasks (3+ overdue)
    const today = new Date().toISOString().split('T')[0]
    const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today)

    if (overdueTasks.length >= 3 && overdueTasks.length !== lastOverdueCount) {
      addNotification({
        type: 'warning',
        title: 'Productivity Alert',
        message: 'AI suggests reorganizing your plan. You have 3+ overdue tasks.'
      })
      setLastOverdueCount(overdueTasks.length)
    } else if (overdueTasks.length < 3) {
      setLastOverdueCount(overdueTasks.length)
    }
  }, [tasks, calculateMetrics, addNotification, lastOverdueCount])

  const generateAiPlan = async () => {
    setIsAiLoading(true)
    try {
      const stats = JSON.parse(localStorage.getItem('bodhai_productivity_stats')) || {}
      const user = JSON.parse(localStorage.getItem('user')) || { name: 'Learner' }

      const response = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'productivity',
          user_input: 'Generate next study plan',
          context: {
            completed_tasks: tasks.filter(t => t.completed).map(t => t.taskTitle),
            pending_tasks: tasks.filter(t => !t.completed).map(t => t.taskTitle),
            current_topic: tasks[0]?.relatedTopic || 'Software Development',
            learning_track: 'Backend Development', // Fallback or get from context
            completion_rate: stats.completionRate || 0
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate AI plan')

      const data = await response.json()
      setAiPlan(data.reply)

      addNotification({
        type: 'success',
        title: 'Smart Plan Generated',
        message: 'AI has updated your productivity suggestions.'
      })
    } catch (error) {
      console.error('AI Plan Error:', error)
      setAiPlan('### 📅 Smart Plan\n\n1. Review pending tasks (30m)\n2. Complete one high priority task (45m)\n3. Plan tomorrow\'s goals (15m)\n\n### 🎯 Focus Advice\nStay consistent and tackle one task at a time.')
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTask.taskTitle) return

    const task = {
      ...newTask,
      id: Date.now(),
      completed: false,
      createdAt: new Date().toISOString()
    }

    setTasks([task, ...tasks])
    setNewTask({
      taskTitle: '',
      dueDate: '',
      priority: 'Medium',
      relatedTopic: 'General',
      estimatedTimeMinutes: 30
    })
    setShowForm(false)
  }

  const toggleTask = (id) => {
    let completedCount = 0
    setTasks(prev => {
      const newTasks = prev.map(t => {
        if (t.id === id) {
          const isCompleting = !t.completed
          if (isCompleting) {
            addNotification({
              type: 'task',
              title: 'Task completed',
              message: `You completed: ${t.taskTitle}`
            })
            // Trigger AI plan generation on completion
            setTimeout(() => generateAiPlan(), 100)
          }
          return { ...t, completed: isCompleting }
        }
        return t
      })
      return newTasks
    })
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    rate: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0
  }

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Productivity Planner</h1>
          <p>Optimize your learning schedule and stay on track</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="action-btn secondary"
            onClick={generateAiPlan}
            disabled={isAiLoading}
          >
            {isAiLoading ? (
              <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} />
            ) : (
              <Sparkles size={18} style={{ marginRight: '8px' }} />
            )}
            AI Study Plan
          </button>
          <button className="action-btn" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> {showForm ? 'Close' : 'Add Task'}
          </button>
        </div>
      </header>

      <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Left Column: Stats & Add Task & AI Plan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="dashboard-card gradient-border">
            <div className="card-header">
              <Target size={20} />
              <h3>Daily Progress</h3>
            </div>
            <div className="card-content">
              <div className="plan-progress" style={{ borderTop: 'none', paddingTop: 0 }}>
                <span>{stats.completed} of {stats.total} tasks completed ({stats.rate}%)</span>
                <div className="progress-bar small" style={{ width: '100%', margin: '12px 0' }}>
                  <div className="progress" style={{ width: `${stats.rate}%` }}></div>
                </div>
              </div>
              <div className="project-stats">
                <div><Clock size={14} /><span>{stats.pending} pending</span></div>
                <div><CheckCircle2 size={14} /><span>{stats.completed} done</span></div>
              </div>
            </div>
          </div>

          {aiPlan && (
            <div className="dashboard-card ai-plan-card" style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div className="card-header" style={{ color: 'var(--accent-primary)' }}>
                <Sparkles size={20} />
                <h3>AI Adaptive Insights</h3>
              </div>
              <div className="card-content ai-plan-content" style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {aiPlan}
              </div>
            </div>
          )}

          {showForm && (
            <div className="auth-card" style={{ maxWidth: '100%' }}>
              <h3>New Task</h3>
              <form onSubmit={handleAddTask}>
                <div className="form-group">
                  <label>Task Title</label>
                  <input
                    type="text"
                    value={newTask.taskTitle}
                    onChange={(e) => setNewTask({ ...newTask, taskTitle: e.target.value })}
                    placeholder="What needs to be done?"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Estimated Time (min)</label>
                    <input
                      type="number"
                      value={newTask.estimatedTimeMinutes}
                      onChange={(e) => setNewTask({ ...newTask, estimatedTimeMinutes: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      style={{
                        width: '100%',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 16px',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Related Topic</label>
                    <input
                      type="text"
                      value={newTask.relatedTopic}
                      onChange={(e) => setNewTask({ ...newTask, relatedTopic: e.target.value })}
                      placeholder="e.g. React, Python"
                    />
                  </div>
                </div>
                <button type="submit" className="action-btn">Save Task</button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Task List */}
        <div className="dashboard-card">
          <div className="card-header">
            <CalendarCheck size={20} />
            <h3>To-Do List</h3>
          </div>
          <div className="card-content">
            <div className="tasks-list" style={{ gap: '16px' }}>
              {tasks.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No tasks found. Add one to get started!</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className={`task-item ${task.completed ? 'done' : ''}`} style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }} onClick={() => toggleTask(task.id)}>
                      <div className={`checkbox ${task.completed ? 'checked' : ''}`}>
                        {task.completed && <CheckCircle2 size={16} color="white" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ display: 'block' }}>{task.taskTitle}</span>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span className={`tag ${task.priority.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>{task.priority}</span>
                          {task.dueDate && <span className="tag" style={{ fontSize: '10px', padding: '2px 6px' }}>{task.dueDate}</span>}
                          {task.relatedTopic && <span className="tag" style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(139, 92, 246, 0.1)' }}>{task.relatedTopic}</span>}
                          {task.estimatedTimeMinutes && <span className="tag" style={{ fontSize: '10px', padding: '2px 6px' }}><Clock size={10} style={{ marginRight: '2px' }} /> {task.estimatedTimeMinutes}m</span>}
                        </div>
                      </div>
                    </div>
                    <button className="icon-btn" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '8px' }} onClick={() => deleteTask(task.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductivityPlanner
