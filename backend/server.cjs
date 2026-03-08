const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const uuidv4 = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Middleware
app.use(cors());
app.use(express.json());

// Mock database for demo purposes
let roadmaps = [
  {
    id: 'python-basics',
    title: 'Python Fundamentals',
    description: 'Master the basics of Python programming, from variables to object-oriented programming.',
    level: 'Beginner',
    duration: '12 hours',
    track: 'backend',
    is_custom: false,
    phases: [
      {
        id: 'p1',
        title: 'Foundations',
        order: 1,
        topics: [
          { id: 't1', title: 'Python Syntax', description: 'Basic syntax and variables.', order: 1, estimated_time: '1h' },
          { id: 't2', title: 'Loops & Conditionals', description: 'If statements and for loops.', order: 2, estimated_time: '2h' }
        ]
      },
      {
        id: 'p2',
        title: 'Data Structures',
        order: 2,
        topics: [
          { id: 't3', title: 'Lists & Tuples', description: 'Working with arrays.', order: 1, estimated_time: '1h' },
          { id: 't4', title: 'Dictionaries', description: 'Key-value pairs.', order: 2, estimated_time: '1h' }
        ]
      }
    ]
  },
  {
    id: 'react-mastery',
    title: 'Modern React Development',
    description: 'Learn to build modern, interactive user interfaces with React.',
    level: 'Intermediate',
    duration: '24 hours',
    track: 'frontend',
    is_custom: false,
    phases: [
      {
        id: 'rp1',
        title: 'React Core',
        order: 1,
        topics: [
          { id: 'rt1', title: 'JSX & Components', description: 'Building UI blocks.', order: 1, estimated_time: '2h' },
          { id: 'rt2', title: 'State & Props', description: 'Data flow in React.', order: 2, estimated_time: '3h' }
        ]
      }
    ]
  },
  {
    id: 'ai-fundamentals',
    title: 'AI & Machine Learning',
    description: 'Introduction to machine learning concepts and neural networks.',
    level: 'Advanced',
    duration: '40 hours',
    track: 'ai',
    is_custom: false,
    phases: [
      {
        id: 'aip1',
        title: 'ML Basics',
        order: 1,
        topics: [
          { id: 'ait1', title: 'Linear Regression', description: 'Basic predictive modeling.', order: 1, estimated_time: '4h' },
          { id: 'ait2', title: 'Neural Networks', description: 'Intro to deep learning.', order: 2, estimated_time: '6h' }
        ]
      }
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science with Python',
    description: 'Learn to analyze data and build visual stories.',
    level: 'Intermediate',
    duration: '30 hours',
    track: 'backend',
    is_custom: false,
    phases: [
      {
        id: 'dsp1',
        title: 'Data Analysis',
        order: 1,
        topics: [
          { id: 'dst1', title: 'Pandas & NumPy', description: 'Data manipulation libraries.', order: 1, estimated_time: '5h' }
        ]
      }
    ]
  }
];

let learningProgress = {}; // { userId: { topicId: true } }

// Auth Middleware
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  // Simple token parsing
  req.userId = 'mock-user-id';
  req.userRole = token.startsWith('admin-token-') ? 'admin' : 'user';
  next();
};

const adminGuard = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Admin access required' });
  }
  next();
};

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const userRole = email === 'admin@bodhai.com' ? 'admin' : 'user';
  const token = userRole === 'admin' ? 'admin-token-mock' : 'user-token-mock';
  
  res.json({
    status: 'success',
    data: {
      access_token: token,
      user: {
        id: 'mock-user-id',
        email,
        first_name: 'John',
        role: userRole
      }
    }
  });
});

// Learning Routes
app.get('/api/learning/roadmaps', requireAuth, (req, res) => {
  const roadmapList = roadmaps.map(r => {
    // Calculate progress
    const allTopics = r.phases.flatMap(p => p.topics);
    const userProgress = learningProgress[req.userId] || {};
    const completedCount = allTopics.filter(t => userProgress[t.id]).length;
    const progress = allTopics.length > 0 ? (completedCount / allTopics.length) * 100 : 0;
    
    return {
      id: r.id,
      title: r.title,
      level: r.level,
      duration: r.duration,
      track: r.track,
      is_custom: r.is_custom,
      progress: Math.round(progress)
    };
  });
  res.json({ status: 'success', data: roadmapList });
});

app.get('/api/learning/roadmap/:id', requireAuth, (req, res) => {
  const roadmap = roadmaps.find(r => r.id === req.params.id);
  if (!roadmap) return res.status(404).json({ status: 'error', message: 'Roadmap not found' });
  
  const userProgress = learningProgress[req.userId] || {};
  const data = JSON.parse(JSON.stringify(roadmap));
  
  data.phases.forEach(p => {
    p.topics.forEach(t => {
      t.completed = !!userProgress[t.id];
    });
  });
  
  res.json({ status: 'success', data });
});

app.post('/api/learning/progress', requireAuth, (req, res) => {
  const { topic_id, completed } = req.body;
  if (!learningProgress[req.userId]) learningProgress[req.userId] = {};
  learningProgress[req.userId][topic_id] = completed;
  
  res.json({ status: 'success', data: { topic_id, completed } });
});

app.get('/api/learning/dashboard', requireAuth, (req, res) => {
  const currentRoadmap = roadmaps[0];
  const userProgress = learningProgress[req.userId] || {};
  const allTopics = currentRoadmap.phases.flatMap(p => p.topics);
  const completedCount = allTopics.filter(t => userProgress[t.id]).length;
  const progress = allTopics.length > 0 ? (completedCount / allTopics.length) * 100 : 0;
  
  const nextTopic = allTopics.find(t => !userProgress[t.id]);
  
  res.json({
    status: 'success',
    data: {
      current_roadmap: {
        id: currentRoadmap.id,
        title: currentRoadmap.title,
        progress: Math.round(progress)
      },
      recommended_next_lesson: nextTopic ? { id: nextTopic.id, title: nextTopic.title } : null,
      total_completed_topics: Object.values(userProgress).filter(v => v).length
    }
  });
});

app.post('/api/learning/roadmaps/generate', requireAuth, (req, res) => {
  const { goal, technology, timeline, level } = req.body;
  const newRoadmap = {
    id: 'custom-' + Date.now(),
    title: goal + ' with ' + technology,
    description: 'Custom path for your goal.',
    level,
    duration: timeline,
    track: 'backend',
    is_custom: true,
    phases: [
      {
        id: 'cp1',
        title: 'Getting Started',
        order: 1,
        topics: [
          { id: 'ct1', title: 'Intro to ' + technology, description: 'Basic concepts.', order: 1, estimated_time: '2h' },
          { id: 'ct2', title: 'Environment Setup', description: 'Preparing tools.', order: 2, estimated_time: '1h' }
        ]
      }
    ]
  };
  roadmaps.push(newRoadmap);
  res.json({ status: 'success', data: newRoadmap });
});

// AI Mentor Route
app.post('/api/ai/mentor', requireAuth, (req, res) => {
  const { mode } = req.body;
  const mockReplies = {
    "learn": "I'm here to explain this concept clearly. Think of it like building a house...",
    "code": "I've analyzed your code. The logic looks correct, but consider optimizing your loops...",
    "roadmap": "Based on your goals, this path is designed to help you succeed quickly.",
    "productivity": "Here's a plan to help you focus on your most important tasks today."
  };
  res.json({ reply: mockReplies[mode] || "How can I help you today?" });
});

// Admin Routes
app.get('/api/admin/users', requireAuth, adminGuard, (req, res) => {
  res.json({
    status: 'success',
    data: [
      { id: 'mock-user-id', first_name: 'John', last_name: 'Doe', email: 'user@example.com', role: 'user', created_at: new Date().toISOString() },
      { id: 'admin-001', first_name: 'Admin', last_name: 'User', email: 'admin@bodhai.com', role: 'admin', created_at: new Date().toISOString() }
    ]
  });
});

app.get('/api/admin/projects', requireAuth, adminGuard, (req, res) => {
  res.json({
    status: 'success',
    data: [
      { id: 'proj-1', title: 'AI Study Helper', user_email: 'user@example.com', created_at: new Date().toISOString() }
    ]
  });
});

app.get('/api/admin/analytics', requireAuth, adminGuard, (req, res) => {
  res.json({
    status: 'success',
    data: {
      total_users: 2,
      active_users: 1,
      total_projects: 1,
      ai_requests_today: 45
    }
  });
});

app.get('/api/admin/roadmaps', requireAuth, adminGuard, (req, res) => {
  res.json({ status: 'success', data: roadmaps });
});

app.get('/api/admin/user-progress', requireAuth, adminGuard, (req, res) => {
  res.json({
    status: 'success',
    data: [
      { email: 'user@example.com', completed_topics: Object.values(learningProgress['mock-user-id'] || {}).filter(v => v).length }
    ]
  });
});

app.delete('/api/admin/roadmap/:id', requireAuth, adminGuard, (req, res) => {
  roadmaps = roadmaps.filter(r => r.id !== req.params.id);
  res.json({ status: 'success', message: 'Roadmap deleted' });
});

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
