import React from 'react'
import { Play, MessageCircle, FolderGit2, CheckCircle2, ArrowRight, Clock, Target } from 'lucide-react'

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
              <p className="last-message">"Let me explain recursion with a simple example..."</p>
              <span className="timestamp">2 hours ago</span>
            </div>
          </div>
          <button className="action-btn secondary">Ask a Question <ArrowRight size={16} /></button>
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
    </div>
  )
}

export default Dashboard
