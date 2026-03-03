import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, FolderKanban, Code2, CalendarCheck, Settings, Brain } from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'learn', label: 'Learn', icon: BookOpen, path: '/learn' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/projects' },
  { id: 'code', label: 'Code Assistant', icon: Code2, path: '/code-assistant' },
  { id: 'planner', label: 'Productivity Planner', icon: CalendarCheck, path: '/productivity' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo-section">
        <div className="logo-icon">
          <Brain size={32} />
        </div>
        <span className="logo-text">BodhAI</span>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar
