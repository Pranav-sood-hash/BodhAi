import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, User, Sparkles } from 'lucide-react'

function Header({ onToggleAi, isAiPanelOpen }) {
  return (
    <header className="header">
      <div className="search-bar">
        <Search size={18} />
        <input type="text" placeholder="Search courses, projects, or ask AI..." />
      </div>

      <div className="header-actions">
        <button
          className={`icon-btn ai-toggle-btn ${isAiPanelOpen ? 'active' : ''}`}
          onClick={onToggleAi}
          title="Toggle AI Mentor"
        >
          <Sparkles size={20} />
        </button>
        <button className="icon-btn notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <Link to="/profile" className="user-avatar">
          <User size={20} />
        </Link>
      </div>
    </header>
  )
}

export default Header
