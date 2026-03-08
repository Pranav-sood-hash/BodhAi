import React, { useEffect } from 'react'
import { useState } from 'react'
import { Send, Sparkles, MoreVertical, Bot, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'

function AIMentorChat({ isOpen, onClose }) {
  const location = useLocation()
  const { addNotification } = useNotifications()

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('aiMentorHistory')
      return saved ? JSON.parse(saved) : [
        { id: 1, role: 'assistant', content: "Hello Pranav! I'm your AI learning mentor. How can I help you today?" }
      ]
    } catch (e) {
      console.error('Error parsing AI mentor history:', e)
      return [{ id: 1, role: 'assistant', content: "Hello Pranav! I'm your AI learning mentor. How can I help you today?" }]
    }
  })

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Save only last 5 interactions (user + assistant pairs)
  useEffect(() => {
    try {
      // Each interaction is a pair of user and assistant messages
      // Let's keep the last 10 messages (5 pairs) + the initial greeting
      const messagesToSave = messages.slice(-11)
      localStorage.setItem('aiMentorHistory', JSON.stringify(messagesToSave))
    } catch (e) {
      console.error('Error saving AI mentor history:', e)
    }
  }, [messages])

  // Listen for external queries (from pages)
  useEffect(() => {
    const handleExternalQuery = (e) => {
      const { user_input, mode, context } = e.detail
      if (user_input) {
        processAIRequest(user_input, mode, context)
      }
    }

    window.addEventListener('ai-mentor-query', handleExternalQuery)
    return () => window.removeEventListener('ai-mentor-query', handleExternalQuery)
  }, [location.pathname]) // location.pathname dependency if context depends on it

  const getModeFromPath = (path) => {
    if (path.includes('learn')) return 'learn'
    if (path.includes('code')) return 'code'
    if (path.includes('productivity')) return 'productivity'
    if (path.includes('projects')) return 'roadmap'
    return 'learn'
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const userInput = input
    setInput('')
    await processAIRequest(userInput)
  }

  const processAIRequest = async (userInput, customMode = null, customContext = null) => {
    const userMessage = { id: Date.now(), role: 'user', content: userInput }
    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    const mode = customMode || getModeFromPath(location.pathname)
    const context = customContext || {
      user_level: 'beginner',
      current_page: location.pathname.substring(1) || 'dashboard'
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mode,
          user_input: userInput,
          context
        })
      })

      const data = await response.json()

      setIsTyping(false)
      if (data.reply) {
        const newMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.reply
        }
        setMessages(prev => [...prev, newMessage])

        // Add notification for AI response
        const messagePreview = data.reply.substring(0, 80)
        addNotification({
          type: 'ai',
          title: 'AI Mentor replied',
          message: messagePreview + (data.reply.length > 80 ? '...' : '')
        })
      } else {
        throw new Error('No reply from AI')
      }
    } catch (error) {
      console.error('Error fetching AI response:', error)
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again later."
      }])
    }
  }

  const quickQuestions = ['Explain recursion', 'Help with React hooks', 'Debug my code', 'Create study plan']

  return (
    <aside className={`ai-panel ${isOpen ? 'show' : ''}`}>
      <div className="ai-panel-header">
        <div className="ai-title">
          <div className="ai-avatar"><Sparkles size={16} /></div>
          <div>
            <h3>AI Mentor</h3>
            <span className="status">● Online</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="icon-btn mobile-only" onClick={onClose}><X size={18} /></button>
          <button className="icon-btn"><MoreVertical size={18} /></button>
        </div>
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
            <button key={i} className="quick-question" onClick={() => processAIRequest(q)}>{q}</button>
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
