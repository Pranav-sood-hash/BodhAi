import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, User, Sparkles, X, Menu } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'
import { formatRelativeTime } from '../utils/timeFormatter'

function Header({ onToggleAi, isAiPanelOpen, onToggleSidebar, isSidebarOpen }) {
  const { recentNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId)
  }

  const getNotificationIcon = (type) => {
    const icons = {
      ai: '🤖',
      task: '✓',
      project: '📁',
      system: 'ℹ️'
    }
    return icons[type] || 'ℹ️'
  }

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="icon-btn mobile-only menu-toggle-btn"
          onClick={onToggleSidebar}
          title="Toggle Sidebar"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search courses, projects, or ask AI..." />
        </div>
      </div>

      <div className="header-actions">
        <button
          className={`icon-btn ai-toggle-btn ${isAiPanelOpen ? 'active' : ''}`}
          onClick={onToggleAi}
          title="Toggle AI Mentor"
        >
          <Sparkles size={20} />
        </button>

        <div className="notification-container" ref={dropdownRef}>
          <button
            className="icon-btn notification-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-read" onClick={markAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {recentNotifications.length === 0 ? (
                  <div className="notification-empty">
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  recentNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="notification-icon">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">
                          {formatRelativeTime(notification.timestamp)}
                        </div>
                      </div>
                      {!notification.read && <div className="unread-indicator"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="user-avatar">
          <User size={20} />
        </Link>
      </div>
    </header>
  )
}

export default Header
