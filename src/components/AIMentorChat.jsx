import React from 'react'
import { useState } from 'react'
import { Send, Sparkles, MoreVertical, Bot } from 'lucide-react'

function AIMentorChat() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: "Hello Pranav! I'm your AI learning mentor. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return
    const userMessage = { id: Date.now(), role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: "That's a great question! Let me help you understand this concept better." }])
    }, 1500)
  }

  const quickQuestions = ['Explain recursion', 'Help with React hooks', 'Debug my code', 'Create study plan']

  return (
    <aside className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-title">
          <div className="ai-avatar"><Sparkles size={16} /></div>
          <div>
            <h3>AI Mentor</h3>
            <span className="status">● Online</span>
          </div>
        </div>
        <button className="icon-btn"><MoreVertical size={18} /></button>
      </div>

      <div className="ai-panel-content">
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}>
              {msg.role === 'assistant' && <div className="message-avatar"><Bot size={14} /></div>}
              <div className="message-bubble">{msg.content}</div>
            </div>
          ))}
          {isTyping && (
            <div className="message assistant">
              <div className="message-avatar"><Bot size={14} /></div>
              <div className="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>

        <div className="quick-questions">
          {quickQuestions.map((q, i) => (
            <button key={i} className="quick-question" onClick={() => setInput(q)}>{q}</button>
          ))}
        </div>
      </div>

      <div className="ai-panel-footer">
        <div className="input-container">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask anything..." />
          <button className={`send-btn ${input.trim() ? 'active' : ''}`} onClick={handleSend}><Send size={18} /></button>
        </div>
      </div>
    </aside>
  )
}

export default AIMentorChat
