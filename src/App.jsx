import React from 'react'
import { useState } from 'react'
import LandingPage from './components/LandingPage'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import AIMentorChat from './components/AIMentorChat'
import './styles/App.css'

function App() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Show landing page first
  if (!showDashboard) {
    return <LandingPage onGetStarted={() => setShowDashboard(true)} />
  }

  // Show dashboard when user clicks "Get Started"
  return (
    <div className="app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <Header />
        <Dashboard activeTab={activeTab} />
      </main>
      <AIMentorChat />
    </div>
  )
}

export default App
