import React, { useState, useEffect } from 'react'
import { Sparkles, Code2, Play, Bug, MessageSquare, Send } from 'lucide-react'

function CodeAssistant() {
  const [code, setCode] = useState('')
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('aiChatHistory')
    return saved ? JSON.parse(saved) : [
      { id: 1, role: 'assistant', content: "Hello! Paste your code here and I'll help you explain, fix, or optimize it." }
    ]
  })

  useEffect(() => {
    localStorage.setItem('aiChatHistory', JSON.stringify(chatHistory))
  }, [chatHistory])

  const handleAction = (type) => {
    if (!code.trim()) {
      alert('Please paste some code first!')
      return
    }

    const userMessage = { 
      id: Date.now(), 
      role: 'user', 
      content: `${type}: \n\n\`\`\`javascript\n${code}\n\`\`\`` 
    }
    
    setChatHistory(prev => [...prev, userMessage])

    // Simulate AI response
    setTimeout(() => {
      let response = ''
      if (type === 'Explain Code') {
        response = "This code defines a function that calculates... It uses a loop to iterate through the data and returns the final result."
      } else if (type === 'Fix Error') {
        response = "I've identified an issue with your code! It looks like you're missing a closing bracket or a semicolon. Try adding it to fix the error."
      } else if (type === 'Optimize Code') {
        response = "Your code can be optimized! Instead of using a traditional loop, consider using the `.map()` or `.reduce()` methods for better performance and readability."
      }

      const aiResponse = { id: Date.now() + 1, role: 'assistant', content: response }
      setChatHistory(prev => [...prev, aiResponse])
    }, 1000)
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
              <button className="action-btn" onClick={() => handleAction('Explain Code')}>
                <MessageSquare size={16} /> Explain
              </button>
              <button className="action-btn" onClick={() => handleAction('Fix Error')}>
                <Bug size={16} /> Fix Error
              </button>
              <button className="action-btn secondary" onClick={() => handleAction('Optimize Code')}>
                <Sparkles size={16} /> Optimize
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
