import React from 'react'
import { Search, Bell, User } from 'lucide-react'

function Header() {
  return (
    <header className="header">
      <div className="search-bar">
        <Search size={18} />
        <input type="text" placeholder="Search courses, projects, or ask AI..." />
      </div>

      <div className="header-actions">
        <button className="icon-btn notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <button className="user-avatar">
          <User size={20} />
        </button>
      </div>
    </header>
  )
}

export default Header
