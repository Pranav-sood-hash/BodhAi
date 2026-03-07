# BodhAI Backend Setup Guide

## Overview

The BodhAI backend is a Flask-based Python application that serves as the API server for the AI learning platform. It handles:

- User authentication and authorization
- Learning progress tracking
- Task management and productivity planning
- AI mentor responses via the `/api/ai/mentor` endpoint
- Bedrock AI integration (placeholder for future integration)

## Architecture

### Directory Structure

```
backend/
├── app.py                 # Main Flask application entry point
├── run.py                 # Flask app factory and configuration
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── test_backend.py        # Backend health check tests
│
├── app/                   # Main application package
│   ├── routes/            # Route blueprints
│   │   ├── auth_routes.py      # /api/auth endpoints
│   │   ├── productivity_routes.py  # /api/tasks endpoints
│   │   └── learning_routes.py   # /api/learning endpoints
│   ├── services/          # Business logic services
│   │   └── ai_service.py       # AI response generation (Bedrock integration)
│   ├── models/            # Database models
│   ├── middleware/        # Request middleware
│   └── utils/             # Utility functions
│       ├── auth_utils.py       # JWT and password utilities
│       ├── otp_utils.py        # OTP generation
│       └── response_utils.py   # Standard response formatting
│
├── ai_mentor/             # AI mentor module
│   ├── ai_router.py       # /api/ai/mentor endpoint
│   ├── mentor_service.py  # AI response orchestration
│   └── prompt_builder.py  # Prompt construction for AI models
│
├── ai_modules/            # AI specialized modules
│   ├── code_analyzer/
│   ├── mentor_chat/
│   └── roadmap_generator/
│
├── database/              # Database configuration
│   └── db.py             # SQLAlchemy initialization
│
└── config/               # Configuration files
```

## API Endpoints

### Health & Status
- `GET /` - Welcome message
- `GET /health` - Server health check

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP verification
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile (requires auth)

### AI Mentor (`/api/ai`)
- `POST /api/ai/mentor` - Get AI mentor response
  - Modes: `learn`, `code`, `productivity`, `roadmap`

### Productivity Tasks (`/api/tasks`)
- `GET /api/tasks` - List all tasks (requires auth)
- `POST /api/tasks` - Create new task (requires auth)
- `GET /api/tasks/<id>` - Get task details (requires auth)
- `PUT /api/tasks/<id>` - Update task (requires auth)
- `DELETE /api/tasks/<id>` - Delete task (requires auth)
- `GET /api/tasks/stats/overview` - Get task statistics (requires auth)

### Learning Progress (`/api/learning`)
- `GET /api/learning/progress` - Get learning progress (requires auth)
- `POST /api/learning/progress` - Create/update progress (requires auth)
- `GET /api/learning/progress/<id>` - Get progress details (requires auth)
- `GET /api/learning/topics` - Get available topics (requires auth)
- `GET /api/learning/roadmap` - Get learning roadmap (requires auth)
- `GET /api/learning/stats` - Get learning statistics (requires auth)

## Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Server Configuration
PORT=5000
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=sqlite:///bodhai.db
# Or for PostgreSQL: DATABASE_URL=postgresql://user:password@localhost/bodhai_db

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# AWS Configuration (for Bedrock)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
USE_BEDROCK=false  # Set to true when ready to use Bedrock

# OTP Configuration
OTP_EXPIRY_TIME=600
OTP_LENGTH=6
```

## Running the Server

### Development Mode

```bash
python app.py
```

The server will start on `http://localhost:5000`

### Production Mode

```bash
FLASK_ENV=production gunicorn app:create_app
```

## Testing the Backend

### 1. Run Health Check Tests

```bash
python test_backend.py
```

This will verify:
- Flask app initialization
- Route registration
- AI mentor endpoint functionality
- CORS configuration
- Error handling

### 2. Test AI Mentor Endpoint

```bash
curl -X POST http://localhost:5000/api/ai/mentor \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "learn",
    "user_input": "What is Python?",
    "context": {
      "user_level": "beginner",
      "track": "backend",
      "topic": "Python Basics"
    }
  }'
```

Expected response:
```json
{
  "status": "success",
  "message": "...",
  "data": {
    "reply": "### 📘 Concept Explanation\n..."
  }
}
```

### 3. Test Health Endpoints

```bash
# Check server status
curl http://localhost:5000/

# Check health
curl http://localhost:5000/health
```

## Frontend Integration

The frontend (running on `http://localhost:5173` or `http://localhost:3000`) can now call the backend endpoints:

```javascript
// Example: Call AI mentor endpoint
fetch('http://localhost:5000/api/ai/mentor', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    mode: 'learn',
    user_input: 'Explain Python decorators',
    context: {
      user_level: 'intermediate',
      track: 'backend',
      topic: 'Python Advanced'
    }
  })
})
.then(response => response.json())
.then(data => console.log(data.data.reply))
.catch(error => console.error('Error:', error));
```

## AI Mentor Response Modes

### 1. Learn Mode
Provides educational explanations tailored to the user's skill level and learning track.

```json
{
  "mode": "learn",
  "user_input": "What is a decorator in Python?",
  "context": {
    "user_level": "intermediate",
    "track": "backend",
    "topic": "Python Decorators"
  }
}
```

### 2. Code Mode
Analyzes code and provides explanations, debugging, or optimization suggestions.

```json
{
  "mode": "code",
  "user_input": "def fibonacci(n):\n  if n <= 1:\n    return n\n  return fibonacci(n-1) + fibonacci(n-2)",
  "context": {
    "code_mode": "Optimize Code",
    "language": "Python",
    "user_level": "intermediate"
  }
}
```

### 3. Productivity Mode
Suggests prioritized tasks and learning plans.

```json
{
  "mode": "productivity",
  "user_input": "Plan my learning for today",
  "context": {
    "learning_track": "Backend Development",
    "current_topic": "Flask Web Development",
    "completion_rate": 45
  }
}
```

### 4. Roadmap Mode
Generates step-by-step learning roadmaps.

```json
{
  "mode": "roadmap",
  "user_input": "Create a learning path for Django",
  "context": {
    "user_level": "beginner",
    "learning_track": "backend"
  }
}
```

## Configuration Details

### Environment Configurations

#### Development
- Debug mode: ON
- Database: SQLite (local)
- CORS: Permissive (allows localhost)
- Error logging: Verbose

#### Production
- Debug mode: OFF
- Database: PostgreSQL (recommended)
- CORS: Restrictive (specific origins only)
- Error logging: Minimal (security)

### CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite development server)
- `http://localhost:3000` (Standard Node.js dev server)

To add more origins, update the `CORS_ORIGINS` environment variable:
```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://yourfrontend.com
```

## Database

The backend uses SQLAlchemy ORM for database abstraction. By default, SQLite is used for development.

### Database Models

- **User** - User accounts
- **Task** - Productivity tasks
- **LearningProgress** - User learning progress
- **OTPToken** - One-time passwords for verification

### Database Initialization

Tables are automatically created when the server starts (if they don't exist).

To reset the database (development only):
```python
from database.db import drop_tables, create_tables, init_db
from run import create_app

app = create_app()
engine = app.engine
drop_tables(engine)
create_tables(engine)
```

## Error Handling

The backend returns standardized error responses:

```json
{
  "status": "error",
  "error": "validation_error",
  "message": "Email and password are required",
  "details": {
    "field": "email"
  }
}
```

Common error codes:
- `validation_error` - Input validation failed (422)
- `unauthorized` - Missing or invalid authentication (401)
- `forbidden` - User lacks permission (403)
- `not_found` - Resource not found (404)
- `server_error` - Internal server error (500)

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change it:
```bash
PORT=5001 python app.py
```

### Database Errors
If you encounter database errors, try deleting the SQLite file:
```bash
rm backend/bodhai.db
python app.py
```

### CORS Issues
If you're getting CORS errors, verify:
1. The frontend origin is in `CORS_ORIGINS`
2. The request includes proper headers
3. Flask-CORS is installed (`pip install flask-cors`)

### Import Errors
Ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

## Future Enhancements

1. **Bedrock Integration** - Replace mock responses with real AWS Bedrock calls
2. **Database Persistence** - Implement real database storage for users, tasks, and progress
3. **Authentication** - Implement proper JWT-based authentication
4. **Email Service** - Integrate real email sending for OTP verification
5. **Caching** - Add Redis caching for performance
6. **Rate Limiting** - Implement rate limiting to prevent abuse
7. **Logging** - Add comprehensive logging system
8. **Testing** - Add unit and integration tests

## Support

For issues or questions about the backend setup:
1. Check the troubleshooting section above
2. Review error logs in console output
3. Check the Flask debug page at `http://localhost:5000` (if debug mode is on)

---

**Backend Ready!** The Flask server is fully operational and ready to serve the BodhAI frontend.
