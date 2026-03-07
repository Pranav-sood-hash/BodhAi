from flask import Blueprint, request, jsonify
from app.utils import success_response, error_response, require_auth, not_found_response
from datetime import datetime
import uuid

# Mock in-memory task storage for now
# In production, this would use a database
tasks_db = {}

productivity_routes = Blueprint('productivity', __name__, url_prefix='/api/tasks')


@productivity_routes.route('', methods=['GET'])
@require_auth
def get_tasks():
    """
    Get all tasks for the current user.
    
    Query parameters:
    - status: Filter by status (pending, in_progress, completed)
    - priority: Filter by priority (low, medium, high)
    - category: Filter by category
    """
    try:
        user_id = request.user_id
        
        # Filter tasks by user_id
        user_tasks = [task for task in tasks_db.values() if task.get('user_id') == user_id]
        
        # Apply filters
        status = request.args.get('status')
        priority = request.args.get('priority')
        category = request.args.get('category')
        
        if status:
            user_tasks = [t for t in user_tasks if t.get('status') == status]
        if priority:
            user_tasks = [t for t in user_tasks if t.get('priority') == priority]
        if category:
            user_tasks = [t for t in user_tasks if t.get('category') == category]
        
        return success_response({
            'tasks': user_tasks,
            'count': len(user_tasks)
        }, 'Tasks retrieved successfully', 200)
    
    except Exception as e:
        print(f"Get tasks error: {e}")
        return error_response('server_error', str(e), 500)


@productivity_routes.route('', methods=['POST'])
@require_auth
def create_task():
    """
    Create a new task.
    
    Request body:
    {
        "title": "Learn Python Basics",
        "description": "Complete the Python fundamentals course",
        "priority": "high",
        "category": "learning",
        "topic": "Python",
        "estimated_hours": 10,
        "learning_track": "backend"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('invalid_request', 'No JSON data provided', 400)
        
        title = data.get('title', '').strip()
        
        if not title:
            return error_response('validation_error', 'Task title is required', 422)
        
        task_id = str(uuid.uuid4())
        task = {
            'id': task_id,
            'user_id': request.user_id,
            'title': title,
            'description': data.get('description', ''),
            'status': data.get('status', 'pending'),
            'priority': data.get('priority', 'medium'),
            'category': data.get('category'),
            'topic': data.get('topic'),
            'estimated_hours': data.get('estimated_hours'),
            'actual_hours': 0,
            'learning_track': data.get('learning_track', 'backend'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'due_date': data.get('due_date'),
            'completed_at': None
        }
        
        tasks_db[task_id] = task
        
        return success_response(task, 'Task created successfully', 201)
    
    except Exception as e:
        print(f"Create task error: {e}")
        return error_response('server_error', str(e), 500)


@productivity_routes.route('/<task_id>', methods=['GET'])
@require_auth
def get_task(task_id):
    """Get a specific task by ID."""
    try:
        task = tasks_db.get(task_id)
        
        if not task:
            return not_found_response('Task')
        
        if task.get('user_id') != request.user_id:
            return error_response('forbidden', 'You do not have access to this task', 403)
        
        return success_response(task, 'Task retrieved successfully', 200)
    
    except Exception as e:
        print(f"Get task error: {e}")
        return error_response('server_error', str(e), 500)


@productivity_routes.route('/<task_id>', methods=['PUT'])
@require_auth
def update_task(task_id):
    """
    Update a task.
    
    Request body:
    {
        "title": "Updated title",
        "status": "in_progress",
        "priority": "high",
        "actual_hours": 5,
        ...
    }
    """
    try:
        task = tasks_db.get(task_id)
        
        if not task:
            return not_found_response('Task')
        
        if task.get('user_id') != request.user_id:
            return error_response('forbidden', 'You do not have access to this task', 403)
        
        data = request.get_json()
        
        if not data:
            return error_response('invalid_request', 'No JSON data provided', 400)
        
        # Update allowed fields
        allowed_fields = ['title', 'description', 'status', 'priority', 'category', 
                         'topic', 'estimated_hours', 'actual_hours', 'due_date']
        
        for field in allowed_fields:
            if field in data:
                task[field] = data[field]
        
        # Update timestamp
        task['updated_at'] = datetime.utcnow().isoformat()
        
        # If status is completed, set completed_at
        if data.get('status') == 'completed' and not task.get('completed_at'):
            task['completed_at'] = datetime.utcnow().isoformat()
        
        return success_response(task, 'Task updated successfully', 200)
    
    except Exception as e:
        print(f"Update task error: {e}")
        return error_response('server_error', str(e), 500)


@productivity_routes.route('/<task_id>', methods=['DELETE'])
@require_auth
def delete_task(task_id):
    """Delete a task."""
    try:
        task = tasks_db.get(task_id)
        
        if not task:
            return not_found_response('Task')
        
        if task.get('user_id') != request.user_id:
            return error_response('forbidden', 'You do not have access to this task', 403)
        
        del tasks_db[task_id]
        
        return success_response({'id': task_id}, 'Task deleted successfully', 200)
    
    except Exception as e:
        print(f"Delete task error: {e}")
        return error_response('server_error', str(e), 500)


@productivity_routes.route('/stats/overview', methods=['GET'])
@require_auth
def get_stats_overview():
    """Get productivity statistics overview."""
    try:
        user_id = request.user_id
        
        # Get user tasks
        user_tasks = [task for task in tasks_db.values() if task.get('user_id') == user_id]
        
        # Calculate stats
        total_tasks = len(user_tasks)
        completed_tasks = len([t for t in user_tasks if t.get('status') == 'completed'])
        in_progress_tasks = len([t for t in user_tasks if t.get('status') == 'in_progress'])
        pending_tasks = len([t for t in user_tasks if t.get('status') == 'pending'])
        
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        total_hours = sum([t.get('actual_hours', 0) for t in user_tasks])
        
        return success_response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'pending_tasks': pending_tasks,
            'completion_rate': round(completion_rate, 2),
            'total_hours_logged': total_hours
        }, 'Stats retrieved successfully', 200)
    
    except Exception as e:
        print(f"Get stats error: {e}")
        return error_response('server_error', str(e), 500)
