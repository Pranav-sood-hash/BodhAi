import React from 'react'
import { useState, useEffect } from 'react'
import { 
  Brain, 
  Map, 
  Code2, 
  FolderKanban, 
  CalendarCheck, 
  ArrowRight, 
  Sparkles,
  Zap,
  Target,
  Clock,
  Users,
  Star,
  ChevronDown
} from 'lucide-react'
import '../styles/LandingPage.css'

function NeuralBackground() {
  return (
    <div className="neural-bg">
      <svg className="neural-lines" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Neural nodes and connections */}
        {[...Array(20)].map((_, i) => {
          const x = Math.random() * 1920
          const y = Math.random() * 1080
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="url(#lineGrad)" filter="url(#glow)">
                <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + Math.random() * 3}s`} repeatCount="indefinite" />
              </circle>
              <line x1={x} y1={y} x2={x + (Math.random() - 0.5) * 300} y2={y + (Math.random() - 0.5) * 300} 
                stroke="url(#lineGrad)" strokeWidth="1" opacity="0.3">
                <animate attributeName="opacity" values="0.1;0.5;0.1" dur={`${3 + Math.random() * 2}s`} repeatCount="indefinite" />
              </line>
            </g>
          )
        })}
      </svg>
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>
      <div className="gradient-orb orb-3"></div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, gradient }) {
  return (
    <div className={`feature-card ${gradient ? 'gradient-border' : ''}`}>
      <div className="feature-icon">
        <Icon size={32} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function StatCard({ number, label, icon: Icon }) {
  return (
    <div className="stat-card">
      <Icon size={24} className="stat-icon" />
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function LandingPage({ onGetStarted }) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: Map,
      title: "Personalized Learning Roadmaps",
      description: "AI-generated learning paths tailored to your goals, pace, and skill level. From beginner to expert.",
      gradient: true
    },
    {
      icon: Code2,
      title: "AI Coding Assistant",
      description: "Get instant code reviews, explanations, and debugging help. Your 24/7 programming mentor.",
      gradient: true
    },
    {
      icon: FolderKanban,
      title: "Project Builder Mode",
      description: "Build real-world projects with AI guidance. Step-by-step instructions and best practices.",
      gradient: false
    },
    {
      icon: CalendarCheck,
      title: "Productivity Planner",
      description: "Smart scheduling and task management. Stay on track with AI-powered reminders and insights.",
      gradient: false
    }
  ]

  const stats = [
    { number: "50K+", label: "Active Learners", icon: Users },
    { number: "1M+", label: "Code Reviews", icon: Code2 },
    { number: "95%", label: "Success Rate", icon: Target },
    { number: "24/7", label: "AI Support", icon: Clock }
  ]

  return (
    <div className="landing-page">
      <NeuralBackground />

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <div className="nav-logo">
            <Brain size={28} />
          </div>
          <span>BodhAI</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <a href="#testimonials">Testimonials</a>
        </div>
        <button className="nav-cta" onClick={onGetStarted}>
          Get Started <ArrowRight size={16} />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Powered by Advanced AI</span>
          </div>
          
          <h1 className="hero-title">
            Learn Faster.
            <br />
            <span className="gradient-text">Build Smarter.</span>
            <br />
            With AI.
          </h1>
          
          <p className="hero-subtitle">
            Your personal AI mentor for coding, learning, and building. 
            Get customized roadmaps, instant code help, and track your progress — all in one place.
          </p>
          
          <div className="hero-cta-group">
            <button className="hero-cta-primary" onClick={onGetStarted}>
              Start Learning Free
              <ArrowRight size={18} />
            </button>
            <button className="hero-cta-secondary">
              <Zap size={18} />
              Watch Demo
            </button>
          </div>

          <div className="hero-stats">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
        </div>

        <div className="scroll-indicator">
          <ChevronDown size={24} />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-badge">Features</span>
          <h2>Everything you need to <span className="gradient-text">master coding</span></h2>
          <p>Four powerful AI tools designed to accelerate your learning journey</p>
        </div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <span className="section-badge">How it Works</span>
          <h2>Start learning in <span className="gradient-text">3 simple steps</span></h2>
        </div>

        <div className="steps-container">
          {[
            { step: "01", title: "Set Your Goals", desc: "Tell us what you want to learn" },
            { step: "02", title: "Get Your Roadmap", desc: "AI creates a personalized path" },
            { step: "03", title: "Start Building", desc: "Learn by doing with AI guidance" }
          ].map((item, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials">
        <div className="section-header">
          <span className="section-badge">Testimonials</span>
          <h2>Loved by <span className="gradient-text">thousands</span> of learners</h2>
        </div>

        <div className="testimonials-grid">
          {[
            { name: "Sarah Chen", role: "Software Engineer", text: "BodhAI helped me transition from marketing to tech in 6 months. The AI mentor is incredible!", rating: 5 },
            { name: "Alex Kumar", role: "CS Student", text: "The code analyzer caught bugs I missed and explained complex algorithms in simple terms.", rating: 5 },
            { name: "Maria Garcia", role: "Bootcamp Grad", text: "Best investment for my coding journey. The personalized roadmap kept me focused and motivated.", rating: 5 }
          ].map((testimonial, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} size={16} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.name[0]}</div>
                <div>
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <Brain size={64} className="cta-icon" />
          <h2>Ready to accelerate your learning?</h2>
          <p>Join 50,000+ learners who are already building smarter with AI</p>
          
          <button className="cta-button" onClick={onGetStarted}>
            Get Started Free
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <Brain size={24} />
            </div>
            <span>BodhAI</span>
            <p>Learn faster. Build smarter. With AI.</p>
          </div>
          
          <div className="footer-links">
            <div>
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Roadmap</a>
            </div>
            <div>
              <h4>Resources</h4>
              <a href="#">Blog</a>
              <a href="#">Documentation</a>
              <a href="#">Community</a>
            </div>
            <div>
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2026 BodhAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
