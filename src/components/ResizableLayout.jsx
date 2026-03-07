import React, { useState, useEffect, useRef } from 'react'

const DEFAULT_AI_PANEL_WIDTH = 420
const MIN_AI_PANEL_WIDTH = 320
const MAX_AI_PANEL_WIDTH = 700
const STORAGE_KEY = 'bodhai_ai_panel_width'

function ResizableLayout({ children, aiMentorPanel, isAiPanelOpen }) {
  const [aiPanelWidth, setAiPanelWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? Math.min(Math.max(parseInt(saved), MIN_AI_PANEL_WIDTH), MAX_AI_PANEL_WIDTH) : DEFAULT_AI_PANEL_WIDTH
    } catch {
      return DEFAULT_AI_PANEL_WIDTH
    }
  })

  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef(null)

  // Persist panel width to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, aiPanelWidth.toString())
    } catch (e) {
      console.error('Error saving AI panel width:', e)
    }
  }, [aiPanelWidth])

  // Mouse move handler for dragging
  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const newPanelWidth = containerRect.right - e.clientX

    // Enforce min and max constraints
    const constrainedWidth = Math.min(Math.max(newPanelWidth, MIN_AI_PANEL_WIDTH), MAX_AI_PANEL_WIDTH)
    setAiPanelWidth(constrainedWidth)
  }

  // Mouse up handler - stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Mouse down handler on divider - start dragging
  const handleDividerMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  // Add/remove event listeners for dragging
  useEffect(() => {
    if (!isDragging) return

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  // Check if screen is desktop (1024px or larger)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // On mobile/tablet, show AI mentor as overlay modal
  if (!isDesktop) {
    return (
      <div className="main-layout-container mobile">
        <div className="dashboard-content">{children}</div>
        {isAiPanelOpen && aiMentorPanel}
      </div>
    )
  }

  // On desktop, show split layout with resizable divider
  return (
    <div className="main-layout-container desktop" ref={containerRef}>
      <div className="dashboard-content" style={{ flex: 1, minWidth: '400px' }}>
        {children}
      </div>

      {isAiPanelOpen && (
        <>
          <div
            className={`resize-divider ${isDragging ? 'dragging' : ''}`}
            onMouseDown={handleDividerMouseDown}
            role="separator"
            aria-label="Resize AI mentor panel"
          />

          <div
            className="ai-mentor-panel-container"
            style={{ width: `${aiPanelWidth}px`, minWidth: `${MIN_AI_PANEL_WIDTH}px` }}
          >
            {aiMentorPanel}
          </div>
        </>
      )}
    </div>
  )
}

export default ResizableLayout
