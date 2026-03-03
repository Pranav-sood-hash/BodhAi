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

      <div className="code-assistant-grid">
        <div className="dashboard-card editor-card">
          <div className="card-header">
            <Code2 size={20} />
            <h3>Editor</h3>
          </div>
          <div className="card-content editor-content">
            {/* Mode and Language Selectors */}
            <div className="selectors-container">
              <div className="selector-group">
                <label className="selector-label">Code Mode</label>
                <select
                  value={codeMode}
                  onChange={(e) => setCodeMode(e.target.value)}
                  className="selector-select"
                >
                  <option value="Explain Code">Explain Code</option>
                  <option value="Debug Code">Debug Code</option>
                  <option value="Optimize Code">Optimize Code</option>
                </select>
              </div>
              <div className="selector-group">
                <label className="selector-label">Language</label>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="selector-select"
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
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
            />
            <div className="action-buttons">
              <button className="action-btn" onClick={handleAction}>
                <MessageSquare size={16} /> Analyze
              </button>
              <button className="action-btn secondary" onClick={() => setCode('')}>
                <Code2 size={16} /> Clear
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-card response-card">
          <div className="card-header">
            <Sparkles size={20} />
            <h3>AI Response</h3>
          </div>
          <div className="card-content response-content">
            <div className="messages-container assistant-messages">
              {chatHistory.map(msg => (
                <div key={msg.id} className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                  <div className="message-bubble assistant-bubble">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <button className="action-btn secondary clear-history-btn" onClick={() => setChatHistory([])}>
              Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodeAssistant
