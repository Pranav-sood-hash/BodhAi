import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Code2,
  CalendarCheck,
  Settings,
  Brain,
  ShieldAlert,
  X,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "learn", label: "Learn", icon: BookOpen, path: "/learn" },
  { id: "projects", label: "Projects", icon: FolderKanban, path: "/projects" },
  { id: "code", label: "Code Assistant", icon: Code2, path: "/code-assistant" },
  {
    id: "planner",
    label: "Productivity Planner",
    icon: CalendarCheck,
    path: "/productivity",
  },
];

function Sidebar({ isOpen, onClose }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setIsAdmin(user.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [location.pathname, isOpen]);

  return (
    <>
      {isOpen && (
        <div className="sidebar-overlay mobile-only" onClick={onClose} />
      )}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="logo-section">
          <div className="logo-icon">
            <Link to="/" onClick={onClose}>
              <Brain size={32} />
            </Link>
          </div>
          <span className="logo-text">BodhAI</span>
          <button className="icon-btn mobile-only close-sidebar" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                onClick={onClose}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-item admin-nav ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <ShieldAlert size={20} />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={onClose}
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
