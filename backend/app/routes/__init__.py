from flask import Blueprint, jsonify

# Import route modules
from .auth_routes import auth_routes
from .productivity_routes import productivity_routes
from .learning_routes import learning_routes

# Create main blueprint for health checks and root endpoint
main = Blueprint('main', __name__)


@main.route('/')
def index():
    return jsonify({'message': 'Welcome to BodhAI API', 'status': 'running'})


@main.route('/health')
def health():
    return jsonify({'status': 'healthy'})


__all__ = ['main', 'auth_routes', 'productivity_routes', 'learning_routes']
