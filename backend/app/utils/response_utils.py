from flask import jsonify
from typing import Any, Dict, Optional

def success_response(data: Any = None, message: str = 'Success', status_code: int = 200) -> tuple:
    """
    Create a standardized success response.
    
    Args:
        data: The response data
        message: Success message
        status_code: HTTP status code
    
    Returns:
        Flask response tuple (jsonify response, status code)
    """
    response = {
        'status': 'success',
        'message': message,
        'data': data
    }
    return jsonify(response), status_code


def error_response(error: str, message: str = None, status_code: int = 400, details: Dict = None) -> tuple:
    """
    Create a standardized error response.
    
    Args:
        error: Error type/code
        message: Error message
        status_code: HTTP status code
        details: Additional error details
    
    Returns:
        Flask response tuple (jsonify response, status code)
    """
    response = {
        'status': 'error',
        'error': error,
        'message': message or error
    }
    
    if details:
        response['details'] = details
    
    return jsonify(response), status_code


def validation_error(field: str, message: str, status_code: int = 422) -> tuple:
    """
    Create a validation error response.
    
    Args:
        field: The field that failed validation
        message: Validation error message
        status_code: HTTP status code
    
    Returns:
        Flask response tuple (jsonify response, status code)
    """
    response = {
        'status': 'error',
        'error': 'validation_error',
        'message': f'Validation failed for field: {field}',
        'field': field,
        'details': message
    }
    return jsonify(response), status_code


def unauthorized_response(message: str = 'Unauthorized') -> tuple:
    """Create an unauthorized response."""
    return error_response('unauthorized', message, 401)


def forbidden_response(message: str = 'Forbidden') -> tuple:
    """Create a forbidden response."""
    return error_response('forbidden', message, 403)


def not_found_response(resource: str = 'Resource') -> tuple:
    """Create a not found response."""
    return error_response('not_found', f'{resource} not found', 404)


def server_error_response(message: str = 'Internal server error') -> tuple:
    """Create a server error response."""
    return error_response('server_error', message, 500)
