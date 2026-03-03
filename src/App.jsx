import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import AIMentorChat from './components/AIMentorChat'

// Auth Components
import ProtectedRoute from './components/auth/ProtectedRoute'

// Auth Pages
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import EmailVerification from './pages/auth/EmailVerification'
import AvatarSelection from './pages/auth/AvatarSelection'

// Protected Pages
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import Projects from './pages/Projects'
import CodeAssistant from './pages/CodeAssistant'
import ProductivityPlanner from './pages/ProductivityPlanner'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

import './styles/App.css'

function MainLayout({ children }) {
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false)

  return (
    <div className={`app ${isAiPanelOpen ? 'ai-panel-open' : ''}`}>
      <Sidebar />
      <main className="main-content">
        <Header onToggleAi={() => setIsAiPanelOpen(!isAiPanelOpen)} isAiPanelOpen={isAiPanelOpen} />
        {children}
      </main>
      <AIMentorChat isOpen={isAiPanelOpen} onClose={() => setIsAiPanelOpen(false)} />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/avatar-selection" element={<AvatarSelection />} />
        
        {/* Protected Application Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/learn" element={
          <ProtectedRoute>
            <MainLayout>
              <Learn />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute>
            <MainLayout>
              <Projects />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/code-assistant" element={
          <ProtectedRoute>
            <MainLayout>
              <CodeAssistant />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/productivity" element={
          <ProtectedRoute>
            <MainLayout>
              <ProductivityPlanner />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Catch all redirect to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
