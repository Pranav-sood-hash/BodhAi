from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from database.db import Base
from app.models import User, OTPToken
from app.utils import (
    success_response,
    error_response,
    validation_error,
    hash_password,
    verify_password,
    generate_access_token,
    generate_refresh_token,
    generate_otp,
    get_otp_expiry_time,
    is_otp_valid,
    validate_email_format,
    validate_password_strength,
    require_auth
)
from datetime import datetime

auth_routes = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_routes.route('/signup', methods=['POST'])
def signup(db_session=None):
    """
    User signup endpoint.
    
    Request body:
    {
        "email": "user@example.com",
        "password": "SecurePassword123",
        "first_name": "John",
        "last_name": "Doe",
        "learning_track": "backend"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('invalid_request', 'No JSON data provided', 400)
        
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        learning_track = data.get('learning_track', 'backend')
        
        # Validation
        if not email or not password:
            return error_response('validation_error', 'Email and password are required', 422)
        
        if not validate_email_format(email):
            return error_response('validation_error', 'Invalid email format', 422)
        
        is_strong, msg = validate_password_strength(password)
        if not is_strong:
            return error_response('validation_error', msg, 422)
        
        # Mock response - in production, would create user and send OTP
        return success_response({
            'message': 'Signup successful. Please verify your email.',
            'email': email,
            'requires_otp': True
        }, 'Signup initiated', 201)
    
    except Exception as e:
        print(f"Signup error: {e}")
        return error_response('server_error', str(e), 500)


@auth_routes.route('/login', methods=['POST'])
def login():
    """
    User login endpoint.
    
    Request body:
    {
        "email": "user@example.com",
        "password": "SecurePassword123"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('invalid_request', 'No JSON data provided', 400)
        
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        if not email or not password:
            return error_response('validation_error', 'Email and password are required', 422)
        
        # Mock response - in production, would verify credentials
        user_role = 'admin' if email == 'admin@bodhai.com' else 'user'

        return success_response({
            'access_token': generate_access_token('mock-user-id', email, user_role),
            'refresh_token': generate_refresh_token('mock-user-id', email, user_role),
            'user': {
                'id': 'mock-user-id',
                'email': email,
                'first_name': 'John',
                'learning_track': 'backend',
                'role': user_role
            }
        }, 'Login successful', 200)
    
    except Exception as e:
        print(f"Login error: {e}")
        return error_response('server_error', str(e), 500)


@auth_routes.route('/send-otp', methods=['POST'])
def send_otp():
    """
    Send OTP to user email.
    
    Request body:
    {
        "email": "user@example.com",
        "purpose": "verification" or "password_reset"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('invalid_request', 'No JSON data provided', 400)
        
        email = data.get('email', '').strip()
        purpose = data.get('purpose', 'verification')
        
        if not email:
            return error_response('validation_error', 'Email is required', 422)
        
        if not validate_email_format(email):
            return error_response('validation_error', 'Invalid email format', 422)
        
        if purpose not in ['verification', 'password_reset']:
            return error_response('validation_error', 'Purpose must be verification or password_reset', 422)
        
        # Mock response - in production, would generate OTP and send email
        otp_code = generate_otp()
        
        return success_response({
            'email': email,
            'message': f'OTP sent to {email}',
            'otp_code': otp_code,  # In production, don't return this
            'expires_in': 600  # 10 minutes
        }, 'OTP sent successfully', 200)
    
    except Exception as e:
        print(f"Send OTP error: {e}")
        return error_response('server_error', str(e), 500)


@auth_routes.route('/verify-otp', methods=['POST'])
def verify_otp():
    """
    Verify OTP code.
    
    Request body:
    {
        "email": "user@example.com",
        "otp": "123456",
        "purpose": "verification" or "password_reset"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('invalid_request', 'No JSON data provided', 400)
        
        email = data.get('email', '').strip()
        otp = data.get('otp', '').strip()
        purpose = data.get('purpose', 'verification')
        
        if not email or not otp:
            return error_response('validation_error', 'Email and OTP are required', 422)
        
        # Mock response - in production, would verify OTP from database
        if otp == '123456':  # Mock verification
            return success_response({
                'verified': True,
                'email': email,
                'message': 'OTP verified successfully'
            }, 'OTP verified', 200)
        else:
            return error_response('invalid_otp', 'Invalid OTP code', 400)
    
    except Exception as e:
        print(f"Verify OTP error: {e}")
        return error_response('server_error', str(e), 500)


@auth_routes.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Reset password endpoint.
    
    Request body:
    {
        "email": "user@example.com",
        "otp": "123456",
        "new_password": "NewPassword123"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('invalid_request', 'No JSON data provided', 400)
        
        email = data.get('email', '').strip()
        otp = data.get('otp', '').strip()
        new_password = data.get('new_password', '').strip()
        
        if not email or not otp or not new_password:
            return error_response('validation_error', 'Email, OTP, and new password are required', 422)
        
        is_strong, msg = validate_password_strength(new_password)
        if not is_strong:
            return error_response('validation_error', msg, 422)
        
        # Mock response - in production, would verify OTP and update password
        return success_response({
            'email': email,
            'message': 'Password reset successful'
        }, 'Password reset successfully', 200)
    
    except Exception as e:
        print(f"Reset password error: {e}")
        return error_response('server_error', str(e), 500)


@auth_routes.route('/refresh-token', methods=['POST'])
def refresh_token():
    """
    Refresh access token using refresh token.
    
    Request body:
    {
        "refresh_token": "..."
    }
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('refresh_token'):
            return error_response('invalid_request', 'Refresh token is required', 400)
        
        # Mock response - in production, would verify refresh token
        return success_response({
            'access_token': generate_access_token('mock-user-id', 'user@example.com', 'user')
        }, 'Token refreshed successfully', 200)
    
    except Exception as e:
        print(f"Refresh token error: {e}")
        return error_response('server_error', str(e), 500)


@auth_routes.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get current user profile."""
    try:
        # User info is available via request.user_id, request.user_email and request.user_role
        return success_response({
            'id': request.user_id,
            'email': request.user_email,
            'role': request.user_role,
            'first_name': 'John',
            'last_name': 'Doe',
            'skill_level': 'beginner',
            'learning_track': 'backend'
        }, 'Profile retrieved successfully', 200)
    
    except Exception as e:
        print(f"Get profile error: {e}")
        return error_response('server_error', str(e), 500)
