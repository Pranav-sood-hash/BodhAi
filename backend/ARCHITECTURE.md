# BodhAI Backend Architecture Documentation

## Overview

This document describes the clean, modular Flask backend architecture for BodhAI, designed to support Learning, Code Assistant, Productivity, and Dashboard modes while preparing for future AWS integration.

## Architecture Structure

```
backend/
├── app.py                          # Not used (use run.py instead)
├── run.py                          # Flask app initialization & startup
├── config.py                       # Configuration management
├── requirements.txt                # Python dependencies
│
├── app/
│   ├── models/                    # Database models (SQLAlchemy)
│   │   ├── __init__.py            # Exports User, Task, Project, etc.
│   │   ├── user_model.py          # User & OTPToken models
│   │   ├── task_model.py          # Task & LearningProgress models
│   │   └── project_model.py       # Project model
│   │
│   ├── routes/                    # API route handlers
│   │   ├── __init__.py            # Exports all blueprints
│   │   ├── auth_routes.py         # Authentication endpoints
│   │   ├── productivity_routes.py # Task management endpoints
│   │   └── learning_routes.py     # Learning progress endpoints
│   │
│   ├── services/                  # Business logic
│   │   ├── __init__.py            # Exports services
│   │   └── ai_service.py          # AI model integration (Bedrock)
│   │
│   ├── utils/                     # Helper utilities
│   │   ├── __init__.py            # Exports all utilities
│   │   ├── response_utils.py      # Standardized JSON responses
│   │   ├── auth_utils.py          # JWT & password hashing
│   │   └── otp_utils.py           # OTP generation & validation
│   │
│   ├── middleware/                # (Future) Flask middleware
│   └── __init__.py                # App package init
│
├── database/                      # Database layer
│   ├── __init__.py                # Exports database functions
│   └── db.py                      # SQLAlchemy setup & initialization
│
├── ai_mentor/                     # AI Mentor module
│   ├── ai_router.py               # AI Mentor endpoint handler
│   ├── mentor_service.py          # AI response generation
│   └── prompt_builder.py          # Prompt construction
│
├── ai_modules/                    # (Future) Specialized AI modules
│   ├── code_analyzer/             # Code analysis module
│   ├── mentor_chat/               # Chat-based mentoring
│   └── roadmap_generator/         # Learning roadmap generation
│
├── tests/                         # Unit & integration tests
├── .env                           # Environment variables
└── ARCHITECTURE.md                # This file
```

## Core Components

### 1. Configuration Management (config.py)
- Centralized configuration for all environments (development, testing, production)
- Supports multiple database backends (SQLite, PostgreSQL, MongoDB)
- JWT token expiry settings
- AWS/Bedrock configuration
- OTP settings

### 2. Database Layer (database/)
- SQLAlchemy ORM setup
- Session management
- Table creation utilities
- Support for SQLite (development) and PostgreSQL (production)

### 3. Models (app/models/)

**User Model**
- User authentication & profile
- Learning preferences (skill level, track)
- Account status & timestamps

**OTPToken Model**
- Email verification & password reset
- OTP generation & expiry tracking

**Task Model**
- Productivity task management
- Priority & status tracking
- Learning context association

**LearningProgress Model**
- Topic progress tracking
- Hours spent tracking
- Completion metrics

**Project Model**
- Code project storage
- Language & framework tracking
- Project status & difficulty

### 4. Routes (app/routes/)

#### Authentication Routes (`/api/auth/`)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile (requires auth)

#### Productivity Routes (`/api/tasks/`)
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/<id>` - Get task details
- `PUT /api/tasks/<id>` - Update task
- `DELETE /api/tasks/<id>` - Delete task
- `GET /api/tasks/stats/overview` - Get productivity stats

#### Learning Routes (`/api/learning/`)
- `GET /api/learning/progress` - Get learning progress
- `POST /api/learning/progress` - Create/update progress
- `GET /api/learning/progress/<id>` - Get progress details
- `GET /api/learning/topics` - Get available topics
- `GET /api/learning/roadmap` - Get learning roadmap
- `GET /api/learning/stats` - Get learning statistics

#### AI Mentor Routes (`/api/ai/`)
- `POST /api/ai/mentor` - AI Mentor endpoint (existing)

### 5. Services (app/services/)

**AIService**
- Bedrock integration for AI model calls
- Fallback mock responses for development
- Future support for additional AI models
- Structured prompt handling

### 6. Utilities (app/utils/)

**response_utils.py**
- Standardized JSON response formatting
- Success, error, and validation response helpers
- HTTP status code handling

**auth_utils.py**
- Password hashing with bcrypt
- JWT token generation & verification
- Authentication decorator for routes
- Token extraction & validation

**otp_utils.py**
- OTP generation
- OTP validation & expiry checking
- Email format validation
- Password strength validation

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "error": "error_code",
  "message": "Error description",
  "details": { ... }
}
```

## Authentication

- JWT-based authentication
- Tokens include user_id and email
- Access tokens: 1 hour expiry
- Refresh tokens: 30 days expiry
- Protected routes use `@require_auth` decorator

## Future AWS Integration

The backend is designed to easily integrate with AWS services:

- **Amazon Bedrock**: AI model inference (Claude 3)
- **AWS SES**: Email sending for OTP & notifications
- **AWS Cognito**: Alternative authentication provider
- **AWS RDS**: PostgreSQL database migration
- **AWS S3**: File storage for projects & resources

## Environment Variables

Key environment variables (see .env):

```
FLASK_ENV=development
DATABASE_URL=sqlite:///bodhai.db
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
USE_BEDROCK=false
```

## Running the Backend

### Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run Flask development server
python3 run.py

# Or using npm
npm run flask
```

### With Frontend
```bash
# Run both frontend and backend concurrently
npm run dev
```

## Backward Compatibility

✅ **Existing `/api/ai/mentor` endpoint continues to work exactly as before**
- No breaking changes
- Same request/response format
- Mode-based routing (learn, code, productivity, roadmap)
- Mock responses with context awareness

## Testing the API

### Auth Endpoints
```bash
# Signup
curl -X POST http://localhost:5001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123"}'
```

### Productivity Endpoints (requires token)
```bash
# Get tasks
curl -X GET http://localhost:5001/api/tasks \
  -H "Authorization: Bearer <TOKEN>"

# Create task
curl -X POST http://localhost:5001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Learn Python","priority":"high"}'
```

### Learning Endpoints
```bash
# Get progress
curl -X GET http://localhost:5001/api/learning/progress \
  -H "Authorization: Bearer <TOKEN>"

# Get available topics
curl -X GET "http://localhost:5001/api/learning/topics?track=backend"
```

### AI Mentor (no auth required for development)
```bash
curl -X POST http://localhost:5001/api/ai/mentor \
  -H "Content-Type: application/json" \
  -d '{
    "mode":"learn",
    "user_input":"What is a REST API?",
    "context":{"level":"beginner","track":"backend"}
  }'
```

## Next Steps

1. **Frontend Integration**: Connect React frontend to new endpoints
2. **Database Migration**: Move from mock data to persistent storage
3. **AWS Integration**: Set up Bedrock, SES, and Cognito
4. **Email Service**: Implement actual OTP sending via SES
5. **Advanced Features**: Add caching, rate limiting, logging
6. **Testing**: Comprehensive unit & integration tests
7. **Deployment**: Docker containerization & cloud deployment

---

**Architecture created:** 2024
**Last updated:** Current session
