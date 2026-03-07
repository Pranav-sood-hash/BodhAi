from functools import wraps
from flask import request
from .response_utils import error_response

def admin_guard(f):
    """
    Middleware to ensure the user has 'admin' role.
    Assumes `require_auth` middleware has already run and populated `request.user_role`.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # request.user_role is set by the require_auth decorator in auth_utils.py
        if not hasattr(request, 'user_role') or request.user_role != 'admin':
            return error_response('forbidden', 'Admin access required', 403)
        
        return f(*args, **kwargs)
    
    return decorated_function
