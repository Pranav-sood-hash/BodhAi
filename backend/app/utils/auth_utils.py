import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional
from functools import wraps
from flask import request, current_app
from config import Config
from .response_utils import unauthorized_response


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password
    
    Returns:
        Hashed password
    """
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        password: Plain text password to verify
        password_hash: Stored password hash
    
    Returns:
        True if password matches, False otherwise
    """
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def generate_access_token(user_id: str, user_email: str, user_role: str = 'user') -> str:
    """
    Generate a JWT access token.

    Args:
        user_id: User ID
        user_email: User email
        user_role: User role

    Returns:
        JWT token string
    """
    payload = {
        'user_id': user_id,
        'email': user_email,
        'role': user_role,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES)
    }
    
    token = jwt.encode(
        payload,
        Config.JWT_SECRET_KEY,
        algorithm='HS256'
    )
    
    return token


def generate_refresh_token(user_id: str, user_email: str, user_role: str = 'user') -> str:
    """
    Generate a JWT refresh token.

    Args:
        user_id: User ID
        user_email: User email
        user_role: User role

    Returns:
        JWT refresh token string
    """
    payload = {
        'user_id': user_id,
        'email': user_email,
        'role': user_role,
        'type': 'refresh',
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(seconds=Config.JWT_REFRESH_TOKEN_EXPIRES)
    }
    
    token = jwt.encode(
        payload,
        Config.JWT_SECRET_KEY,
        algorithm='HS256'
    )
    
    return token


def verify_token(token: str) -> Tuple[bool, Optional[Dict]]:
    """
    Verify a JWT token.
    
    Args:
        token: JWT token to verify
    
    Returns:
        Tuple of (is_valid: bool, payload: dict or None)
    """
    try:
        payload = jwt.decode(
            token,
            Config.JWT_SECRET_KEY,
            algorithms=['HS256']
        )
        return True, payload
    except jwt.ExpiredSignatureError:
        return False, None
    except jwt.InvalidTokenError:
        return False, None


def require_auth(f):
    """
    Decorator to require authentication for a route.
    
    Expects Authorization header with format: "Bearer <token>"
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return unauthorized_response('Missing Authorization header')
        
        # Check Bearer token format
        try:
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return unauthorized_response('Invalid Authorization header format')
            
            token = parts[1]
        except Exception:
            return unauthorized_response('Invalid Authorization header format')
        
        # Verify token
        is_valid, payload = verify_token(token)
        
        if not is_valid:
            return unauthorized_response('Invalid or expired token')
        
        # Add user info to request context
        request.user_id = payload.get('user_id')
        request.user_email = payload.get('email')
        request.user_role = payload.get('role', 'user')

        return f(*args, **kwargs)
    
    return decorated_function


def extract_token_from_header(auth_header: str) -> Optional[str]:
    """
    Extract token from Authorization header.
    
    Args:
        auth_header: Authorization header value
    
    Returns:
        Token string or None
    """
    try:
        parts = auth_header.split()
        if len(parts) == 2 and parts[0].lower() == 'bearer':
            return parts[1]
    except Exception:
        pass
    
    return None


def get_user_from_token(token: str) -> Optional[Dict]:
    """
    Extract user information from a valid token.
    
    Args:
        token: JWT token
    
    Returns:
        User info dict or None
    """
    is_valid, payload = verify_token(token)
    
    if is_valid and payload:
        return {
            'user_id': payload.get('user_id'),
            'email': payload.get('email'),
            'role': payload.get('role', 'user')
        }
    
    return None
