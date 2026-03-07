from flask import Blueprint, request
from app.utils import (
    success_response,
    error_response,
    require_auth,
    admin_guard
)
from datetime import datetime, timedelta

admin_routes = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_routes.route('/users', methods=['GET'])
@require_auth
@admin_guard
def get_all_users():
    """Get all registered users."""
    try:
        # Mocking user data - in production, would fetch from database
        users = [
            {
                'id': 'mock-user-1',
                'first_name': 'John',
                'last_name': 'Doe',
                'email': 'john@example.com',
                'role': 'user',
                'created_at': (datetime.utcnow() - timedelta(days=30)).isoformat()
            },
            {
                'id': 'mock-user-2',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'email': 'jane@example.com',
                'role': 'user',
                'created_at': (datetime.utcnow() - timedelta(days=15)).isoformat()
            },
            {
                'id': 'mock-admin-1',
                'first_name': 'Admin',
                'last_name': 'User',
                'email': 'admin@bodhai.com',
                'role': 'admin',
                'created_at': (datetime.utcnow() - timedelta(days=60)).isoformat()
            }
        ]
        
        return success_response(users, 'Users retrieved successfully', 200)
    except Exception as e:
        return error_response('server_error', str(e), 500)

@admin_routes.route('/projects', methods=['GET'])
@require_auth
@admin_guard
def get_all_projects():
    """Get all user projects."""
    try:
        # Mocking project data - in production, would fetch from database
        projects = [
            {
                'id': 'proj-1',
                'title': 'AI Study Helper',
                'user_id': 'mock-user-1',
                'user_email': 'john@example.com',
                'created_at': (datetime.utcnow() - timedelta(days=10)).isoformat()
            },
            {
                'id': 'proj-2',
                'title': 'Python Learning Path',
                'user_id': 'mock-user-2',
                'user_email': 'jane@example.com',
                'created_at': (datetime.utcnow() - timedelta(days=5)).isoformat()
            }
        ]
        
        return success_response(projects, 'Projects retrieved successfully', 200)
    except Exception as e:
        return error_response('server_error', str(e), 500)

@admin_routes.route('/analytics', methods=['GET'])
@require_auth
@admin_guard
def get_analytics():
    """Get platform analytics statistics."""
    try:
        analytics = {
            'total_users': 120,
            'active_users': 48,
            'total_projects': 75,
            'ai_requests_today': 630
        }
        
        return success_response(analytics, 'Analytics retrieved successfully', 200)
    except Exception as e:
        return error_response('server_error', str(e), 500)

@admin_routes.route('/user/<user_id>', methods=['DELETE'])
@require_auth
@admin_guard
def delete_user(user_id):
    """Delete a user."""
    try:
        # Mock deletion - in production, would delete from database
        return success_response({'user_id': user_id}, f'User {user_id} deleted successfully', 200)
    except Exception as e:
        return error_response('server_error', str(e), 500)

@admin_routes.route('/project/<project_id>', methods=['DELETE'])
@require_auth
@admin_guard
def delete_project(project_id):
    """Delete a project."""
    try:
        # Mock deletion - in production, would delete from database
        return success_response({'project_id': project_id}, f'Project {project_id} deleted successfully', 200)
    except Exception as e:
        return error_response('server_error', str(e), 500)
