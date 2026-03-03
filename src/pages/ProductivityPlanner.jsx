import React, { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Trash2, CalendarCheck, Clock, Plus, Target, Sparkles } from 'lucide-react'

function ProductivityPlanner() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('productivityTasks')
    return saved ? JSON.parse(saved) : [
      { id: 1, taskTitle: "Complete React fundamentals", dueDate: "2026-03-10", priority: "High", completed: false },
      { id: 2, taskTitle: "Build first AI project", dueDate: "2026-03-15", priority: "Medium", completed: true }
    ]
  })

  const [newTask, setNewTask] = useState({ taskTitle: '', dueDate: '', priority: 'Medium' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    localStorage.setItem('productivityTasks', JSON.stringify(tasks))
  }, [tasks])

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTask.taskTitle) return
    
    const task = {
      ...newTask,
      id: Date.now(),
      completed: false
    }
    
    setTasks([task, ...tasks])
    setNewTask({ taskTitle: '', dueDate: '', priority: 'Medium' })
    setShowForm(false)
  }

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, completed: !t.completed }
      }
      return t
    }))
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  }

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Productivity Planner</h1>
          <p>Optimize your learning schedule and stay on track</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="action-btn secondary" onClick={() => {
            const input = prompt('What is your goal for today?')
            if (input) {
              window.dispatchEvent(new CustomEvent('ai-mentor-query', {
                detail: { user_input: input, mode: 'productivity' }
              }))
            }
          }}>
            <Sparkles size={18} style={{ marginRight: '8px' }} /> AI Study Plan
          </button>
          <button className="action-btn" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> {showForm ? 'Close' : 'Add Task'}
          </button>
        </div>
      </header>

      <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Left Column: Stats & Add Task */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="dashboard-card gradient-border">
            <div className="card-header">
              <Target size={20} />
              <h3>Daily Progress</h3>
            </div>
            <div className="card-content">
              <div className="plan-progress" style={{ borderTop: 'none', paddingTop: 0 }}>
                <span>{stats.completed} of {stats.total} tasks completed</span>
                <div className="progress-bar small" style={{ width: '100%', margin: '12px 0' }}>
                  <div className="progress" style={{ width: `${(stats.completed / stats.total) * 100 || 0}%` }}></div>
                </div>
              </div>
              <div className="project-stats">
                <div><Clock size={14} /><span>{stats.pending} pending</span></div>
                <div><CheckCircle2 size={14} /><span>{stats.completed} done</span></div>
              </div>
            </div>
          </div>

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
                <div className="form-group">
                  <label>Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate} 
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} 
                  />
                </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => toggleTask(task.id)}>
                      <div className={`checkbox ${task.completed ? 'checked' : ''}`}>
                        {task.completed && <CheckCircle2 size={16} color="white" />}
                      </div>
                      <div>
                        <span style={{ display: 'block' }}>{task.taskTitle}</span>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <span className="tag" style={{ fontSize: '10px', padding: '2px 6px' }}>{task.priority}</span>
                          {task.dueDate && <span className="tag" style={{ fontSize: '10px', padding: '2px 6px' }}>{task.dueDate}</span>}
                        </div>
                      </div>
                    </div>
                    <button className="icon-btn" style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }} onClick={() => deleteTask(task.id)}>
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
