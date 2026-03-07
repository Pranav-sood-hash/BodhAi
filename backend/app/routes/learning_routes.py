from flask import Blueprint, request, jsonify
from app.utils import success_response, error_response, require_auth, not_found_response
from datetime import datetime
import uuid

# Mock in-memory learning progress storage for now
# In production, this would use a database
learning_progress_db = {}

learning_routes = Blueprint('learning', __name__, url_prefix='/api/learning')


@learning_routes.route('/progress', methods=['GET'])
@require_auth
def get_learning_progress():
    """
    Get learning progress for current user.
    
    Query parameters:
    - track: Filter by learning track (backend, frontend, ai, fullstack)
    - topic: Filter by specific topic
    """
    try:
        user_id = request.user_id
        
        # Get user's learning progress
        user_progress = [p for p in learning_progress_db.values() 
                        if p.get('user_id') == user_id]
        
        # Apply filters
        track = request.args.get('track')
        topic = request.args.get('topic')
        
        if track:
            user_progress = [p for p in user_progress if p.get('track') == track]
        if topic:
            user_progress = [p for p in user_progress if p.get('topic') == topic]
        
        return success_response({
            'progress': user_progress,
            'count': len(user_progress)
        }, 'Learning progress retrieved successfully', 200)
    
    except Exception as e:
        print(f"Get learning progress error: {e}")
        return error_response('server_error', str(e), 500)


@learning_routes.route('/progress', methods=['POST'])
@require_auth
def create_or_update_learning_progress():
    """
    Create or update learning progress.
    
    Request body:
    {
        "topic": "Python Basics",
        "track": "backend",
        "lessons_completed": 5,
        "practice_exercises_completed": 3,
        "projects_completed": 1,
        "total_hours_spent": 20,
        "progress_percentage": 50
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('invalid_request', 'No JSON data provided', 400)
        
        topic = data.get('topic', '').strip()
        track = data.get('track', '').strip()
        
        if not topic or not track:
            return error_response('validation_error', 'Topic and track are required', 422)
        
        user_id = request.user_id
        
        # Check if progress already exists
        existing_progress = None
        for progress in learning_progress_db.values():
            if (progress.get('user_id') == user_id and 
                progress.get('topic') == topic and 
                progress.get('track') == track):
                existing_progress = progress
                break
        
        if existing_progress:
            # Update existing progress
            progress_id = existing_progress['id']
            progress = existing_progress
            
            # Update fields
            progress['lessons_completed'] = data.get('lessons_completed', progress.get('lessons_completed', 0))
            progress['practice_exercises_completed'] = data.get('practice_exercises_completed', 
                                                               progress.get('practice_exercises_completed', 0))
            progress['projects_completed'] = data.get('projects_completed', 
                                                     progress.get('projects_completed', 0))
            progress['total_hours_spent'] = data.get('total_hours_spent', 
                                                    progress.get('total_hours_spent', 0))
            progress['progress_percentage'] = data.get('progress_percentage', 
                                                      progress.get('progress_percentage', 0))
            progress['status'] = data.get('status', progress.get('status', 'in_progress'))
            progress['updated_at'] = datetime.utcnow().isoformat()
            
            message = 'Learning progress updated successfully'
        else:
            # Create new progress
            progress_id = str(uuid.uuid4())
            progress = {
                'id': progress_id,
                'user_id': user_id,
                'topic': topic,
                'track': track,
                'lessons_completed': data.get('lessons_completed', 0),
                'practice_exercises_completed': data.get('practice_exercises_completed', 0),
                'projects_completed': data.get('projects_completed', 0),
                'total_hours_spent': data.get('total_hours_spent', 0),
                'progress_percentage': data.get('progress_percentage', 0),
                'status': data.get('status', 'in_progress'),
                'started_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
                'completed_at': None
            }
            learning_progress_db[progress_id] = progress
            message = 'Learning progress created successfully'
        
        return success_response(progress, message, 200 if existing_progress else 201)
    
    except Exception as e:
        print(f"Create/update learning progress error: {e}")
        return error_response('server_error', str(e), 500)


@learning_routes.route('/progress/<progress_id>', methods=['GET'])
@require_auth
def get_progress_details(progress_id):
    """Get detailed learning progress for a specific topic."""
    try:
        progress = learning_progress_db.get(progress_id)
        
        if not progress:
            return not_found_response('Learning progress')
        
        if progress.get('user_id') != request.user_id:
            return error_response('forbidden', 'You do not have access to this progress', 403)
        
        return success_response(progress, 'Progress details retrieved successfully', 200)
    
    except Exception as e:
        print(f"Get progress details error: {e}")
        return error_response('server_error', str(e), 500)


@learning_routes.route('/topics', methods=['GET'])
@require_auth
def get_available_topics():
    """Get list of available learning topics for a track."""
    try:
        track = request.args.get('track', 'backend')
        
        # Mock list of topics by track
        topics_by_track = {
            'backend': [
                {
                    'id': 'python-basics',
                    'title': 'Python Basics',
                    'description': 'Learn Python fundamentals',
                    'difficulty': 'beginner',
                    'estimated_hours': 30
                },
                {
                    'id': 'flask-web-dev',
                    'title': 'Flask Web Development',
                    'description': 'Build web apps with Flask',
                    'difficulty': 'intermediate',
                    'estimated_hours': 40
                },
                {
                    'id': 'database-design',
                    'title': 'Database Design',
                    'description': 'Master SQL and database concepts',
                    'difficulty': 'intermediate',
                    'estimated_hours': 35
                }
            ],
            'frontend': [
                {
                    'id': 'html-css',
                    'title': 'HTML & CSS Fundamentals',
                    'description': 'Master web markup and styling',
                    'difficulty': 'beginner',
                    'estimated_hours': 25
                },
                {
                    'id': 'javascript',
                    'title': 'JavaScript Mastery',
                    'description': 'Learn JavaScript from basics to advanced',
                    'difficulty': 'intermediate',
                    'estimated_hours': 40
                },
                {
                    'id': 'react-dev',
                    'title': 'React Development',
                    'description': 'Build modern UIs with React',
                    'difficulty': 'intermediate',
                    'estimated_hours': 35
                }
            ],
            'ai': [
                {
                    'id': 'ml-basics',
                    'title': 'Machine Learning Basics',
                    'description': 'Introduction to ML concepts',
                    'difficulty': 'beginner',
                    'estimated_hours': 35
                },
                {
                    'id': 'deep-learning',
                    'title': 'Deep Learning',
                    'description': 'Neural networks and deep learning',
                    'difficulty': 'advanced',
                    'estimated_hours': 50
                }
            ]
        }
        
        topics = topics_by_track.get(track, [])
        
        return success_response({
            'track': track,
            'topics': topics,
            'count': len(topics)
        }, 'Topics retrieved successfully', 200)
    
    except Exception as e:
        print(f"Get topics error: {e}")
        return error_response('server_error', str(e), 500)


@learning_routes.route('/roadmap', methods=['GET'])
@require_auth
def get_learning_roadmap():
    """Get personalized learning roadmap based on user profile."""
    try:
        track = request.args.get('track', 'backend')
        level = request.args.get('level', 'beginner')
        
        # Mock roadmap
        roadmap = {
            'track': track,
            'level': level,
            'stages': [
                {
                    'stage': 1,
                    'title': 'Foundations',
                    'topics': ['Fundamentals', 'Core Concepts'],
                    'duration_weeks': 4
                },
                {
                    'stage': 2,
                    'title': 'Intermediate Skills',
                    'topics': ['Advanced Topics', 'Best Practices'],
                    'duration_weeks': 6
                },
                {
                    'stage': 3,
                    'title': 'Projects & Application',
                    'topics': ['Real-world Projects', 'Optimization'],
                    'duration_weeks': 8
                }
            ]
        }
        
        return success_response(roadmap, 'Roadmap retrieved successfully', 200)
    
    except Exception as e:
        print(f"Get roadmap error: {e}")
        return error_response('server_error', str(e), 500)


@learning_routes.route('/stats', methods=['GET'])
@require_auth
def get_learning_stats():
    """Get comprehensive learning statistics for the user."""
    try:
        user_id = request.user_id
        
        # Get user's learning progress
        user_progress = [p for p in learning_progress_db.values() 
                        if p.get('user_id') == user_id]
        
        # Calculate stats
        total_topics = len(user_progress)
        completed_topics = len([p for p in user_progress if p.get('status') == 'completed'])
        total_hours = sum([p.get('total_hours_spent', 0) for p in user_progress])
        avg_progress = sum([p.get('progress_percentage', 0) for p in user_progress]) / total_topics if total_topics > 0 else 0
        
        # Group by track
        progress_by_track = {}
        for progress in user_progress:
            track = progress.get('track', 'unknown')
            if track not in progress_by_track:
                progress_by_track[track] = []
            progress_by_track[track].append(progress)
        
        return success_response({
            'total_topics': total_topics,
            'completed_topics': completed_topics,
            'total_hours_spent': total_hours,
            'average_progress_percentage': round(avg_progress, 2),
            'progress_by_track': {
                track: {
                    'topics': len(topics),
                    'avg_progress': round(sum([t.get('progress_percentage', 0) for t in topics]) / len(topics), 2)
                }
                for track, topics in progress_by_track.items()
            }
        }, 'Learning stats retrieved successfully', 200)
    
    except Exception as e:
        print(f"Get learning stats error: {e}")
        return error_response('server_error', str(e), 500)
