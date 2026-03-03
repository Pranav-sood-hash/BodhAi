import React, { useState, useEffect } from 'react'
import { Sparkles, Code2, Play, Bug, MessageSquare, Send } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

function CodeAssistant() {
  const { addNotification } = useNotifications()

  const [code, setCode] = useState('')
  const [codeMode, setCodeMode] = useState('Explain Code')
  const [codeLanguage, setCodeLanguage] = useState('Python')
  const [userLevel, setUserLevel] = useState('beginner')
  const [userTrack, setUserTrack] = useState('backend')

  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('aiChatHistory')
    return saved ? JSON.parse(saved) : [
      { id: 1, role: 'assistant', content: "Hello! Paste your code here and I'll help you explain, fix, or optimize it." }
    ]
  })

  const [codeAssistantHistory, setCodeAssistantHistory] = useState(() => {
    const saved = localStorage.getItem('codeAssistantHistory')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory))
  }, [chatHistory])

  useEffect(() => {
    // Keep only last 5 interactions
    const recentHistory = codeAssistantHistory.slice(0, 5)
    localStorage.setItem('codeAssistantHistory', JSON.stringify(recentHistory))
  }, [codeAssistantHistory])

  const handleAction = () => {
    // Error handling for empty code
    if (!code.trim()) {
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: "Please provide code to analyze."
      }
      setChatHistory(prev => [...prev, errorMessage])
      return
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: `[${codeMode}] [${codeLanguage}]\n\n\`\`\`${codeLanguage.toLowerCase()}\n${code}\n\`\`\``
    }

    setChatHistory(prev => [...prev, userMessage])

    // Fetch from AI Mentor API with structured context
    const fetchAIResponse = async () => {
      try {
        const response = await fetch('/api/ai/mentor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode: 'code',
            user_input: code,
            context: {
              code_mode: codeMode,
              language: codeLanguage,
              user_level: userLevel,
              current_track: userTrack,
              current_page: 'code-assistant'
            }
          })
        })

        const data = await response.json()
        if (data.reply) {
          const aiResponse = { id: Date.now() + 1, role: 'assistant', content: data.reply }
          setChatHistory(prev => [...prev, aiResponse])

          // Save to codeAssistantHistory (last 5 interactions)
          const historyEntry = {
            id: Date.now(),
            mode: codeMode,
            language: codeLanguage,
            snippet: code.substring(0, 200) + (code.length > 200 ? '...' : ''),
            reply: data.reply,
            timestamp: new Date().toISOString()
          }
          setCodeAssistantHistory(prev => [historyEntry, ...prev].slice(0, 5))

          // Add notification
          addNotification({
            type: 'ai',
            title: `Code ${codeMode} Complete`,
            message: `Analyzed ${codeLanguage} code - ${codeMode}`
          })
        }
      } catch (error) {
        console.error('Error fetching AI response:', error)
        const errorResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: "Sorry, I'm having trouble connecting to the AI Mentor. Please try again later."
        }
        setChatHistory(prev => [...prev, errorResponse])
      }
    }

    fetchAIResponse()
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>AI Code Assistant</h1>
        <p>Get instant explanations, debugging help, and optimizations</p>
      </header>

      <div className="cards-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', height: 'calc(100vh - 200px)' }}>
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <Code2 size={20} />
            <h3>Editor</h3>
          </div>
          <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Mode and Language Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Code Mode</label>
                <select
                  value={codeMode}
                  onChange={(e) => setCodeMode(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <option value="Explain Code">Explain Code</option>
                  <option value="Debug Code">Debug Code</option>
                  <option value="Optimize Code">Optimize Code</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Language</label>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <option value="Python">Python</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="SQL">SQL</option>
                </select>
              </div>
            </div>

            <textarea
              className="form-group"
              style={{
                flex: 1,
                width: '100%',
                background: 'rgba(30, 20, 50, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                padding: '20px',
                fontFamily: 'monospace',
                resize: 'none',
                outline: 'none',
                marginBottom: '20px'
              }}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="action-btn" onClick={handleAction}>
                <MessageSquare size={16} /> Analyze
              </button>
              <button className="action-btn secondary" onClick={() => setCode('')}>
                <Code2 size={16} /> Clear
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <Sparkles size={20} />
            <h3>AI Response</h3>
          </div>
          <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="messages-container" style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
              {chatHistory.map(msg => (
                <div key={msg.id} className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`} style={{ marginBottom: '16px' }}>
                  <div className="message-bubble" style={{ fontSize: '14px', maxWidth: '100%' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <button className="action-btn secondary" onClick={() => setChatHistory([])}>
              Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeAssistant
