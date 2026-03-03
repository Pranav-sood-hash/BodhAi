import React, { useState, useEffect } from 'react'
import { Plus, FolderGit2, Trash2, CheckCircle2, ArrowRight } from 'lucide-react'

function ProjectCard({ project, onUpdateProgress, onDelete }) {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <FolderGit2 size={20} />
        <h3>{project.projectName}</h3>
      </div>
      <div className="card-content">
        <div className="project-info">
          <p className="description" style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {project.description}
          </p>
          <div className="project-meta" style={{ marginBottom: '12px' }}>
            <span className="tag">{project.stack}</span>
            <span className="tag" style={{ marginLeft: '8px' }}>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${project.progress}%` }}></div>
          </div>
          <span className="progress-text">{project.progress}% complete</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button className="action-btn" onClick={() => onUpdateProgress(project.id)}>
            Update Progress <ArrowRight size={16} />
          </button>
          <button className="action-btn secondary" onClick={() => onDelete(project.id)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function Projects() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('userProjects')
    return saved ? JSON.parse(saved) : [
      { id: 1, projectName: "E-Commerce API", stack: "Flask + MongoDB", description: "A RESTful API for an e-commerce platform.", progress: 60, createdAt: new Date().toISOString() }
    ]
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const [newProject, setNewProject] = useState({ projectName: '', stack: '', description: '' })

  useEffect(() => {
    localStorage.setItem('userProjects', JSON.stringify(projects))
  }, [projects])

  const handleAddProject = (e) => {
    e.preventDefault()
    if (!newProject.projectName || !newProject.stack) return
    
    const project = {
      ...newProject,
      id: Date.now(),
      progress: 0,
      createdAt: new Date().toISOString()
    }
    
    setProjects([project, ...projects])
    setNewProject({ projectName: '', stack: '', description: '' })
    setShowAddForm(false)
  }

  const handleUpdateProgress = (id) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, progress: Math.min(p.progress + 10, 100) }
      }
      return p
    }))
  }

  const handleDelete = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Projects</h1>
          <p>Build and track your AI projects</p>
        </div>
        <button className="action-btn" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={20} /> {showAddForm ? 'Close' : 'Add Project'}
        </button>
      </header>

      {showAddForm && (
        <div className="auth-card" style={{ marginBottom: '28px', maxWidth: '100%' }}>
          <h3>Add New Project</h3>
          <form onSubmit={handleAddProject}>
            <div className="form-group">
              <label>Project Name</label>
              <input 
                type="text" 
                value={newProject.projectName} 
                onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })} 
                placeholder="e.g. Portfolio Website" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Technology Stack</label>
              <input 
                type="text" 
                value={newProject.stack} 
                onChange={(e) => setNewProject({ ...newProject, stack: e.target.value })} 
                placeholder="e.g. React + Supabase" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input 
                type="text" 
                value={newProject.description} 
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} 
                placeholder="Briefly describe your project" 
              />
            </div>
            <button type="submit" className="action-btn">Create Project</button>
          </form>
        </div>
      )}

      <div className="cards-grid">
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onUpdateProgress={handleUpdateProgress}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default Projects
