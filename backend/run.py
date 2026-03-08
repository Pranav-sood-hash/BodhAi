from flask import Flask, jsonify
from flask_cors import CORS
from config import Config, get_config
from database import init_db, create_tables
import os
import traceback

def create_app(config=None):
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Load configuration
    if config is None:
        config = get_config()

    app.config.from_object(config)

    # Enable CORS with configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', ['http://localhost:5173', 'http://localhost:3000']),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Initialize database
    try:
        engine, SessionLocal = init_db(app)
        app.engine = engine
        app.SessionLocal = SessionLocal

        # Create tables if they don't exist
        create_tables(engine)

        # Seed database with sample data
        seed_db(SessionLocal)
    except Exception as e:
        print(f"Warning: Could not initialize database: {e}")

def seed_db(SessionLocal):
    """Seed the database with sample data if it's empty."""
    from app.models.user_model import User
    from app.models.learning_model import Roadmap, RoadmapPhase, Topic
    import uuid

    session = SessionLocal()

    # Check if admin user exists
    admin_email = 'admin@bodhai.com'
    admin = session.query(User).filter_by(email=admin_email).first()
    if not admin:
        print(f"Creating seed admin user: {admin_email}")
        admin = User(
            id='mock-user-id',
            email=admin_email,
            password_hash='pbkdf2:sha256:260000$...',
            first_name='Admin',
            last_name='User',
            role='admin',
            is_verified=True
        )
        session.add(admin)

    # Check if roadmaps exist
    if session.query(Roadmap).count() == 0:
        print("Creating seed roadmaps...")
        # Python Fundamentals Roadmap
        python_roadmap = Roadmap(
            id=str(uuid.uuid4()),
            title="Python Fundamentals",
            description="Master the basics of Python programming, from variables to object-oriented programming.",
            level="Beginner",
            duration="12 hours",
            track="backend",
            is_custom=False
        )
        session.add(python_roadmap)

        p1 = RoadmapPhase(id=str(uuid.uuid4()), roadmap=python_roadmap, title="Foundations", order=1)
        session.add(p1)

        t1 = Topic(id=str(uuid.uuid4()), phase=p1, title="Syntax & Basics", description="Learn variables and loops.", order=1, estimated_time="1 hour")
        session.add(t1)

    session.commit()
    session.close()

def register_error_handlers(app):
    from app.routes import main, auth_routes, productivity_routes, learning_routes, admin_routes
    from ai_mentor.ai_router import ai_bp

    app.register_blueprint(main)
    app.register_blueprint(auth_routes)
    app.register_blueprint(productivity_routes)
    app.register_blueprint(learning_routes)
    app.register_blueprint(admin_routes)
    app.register_blueprint(ai_bp, url_prefix="/api/ai")

    # Register error handlers
    register_error_handlers(app)

    return app


def register_error_handlers(app):
    """Register global error handlers."""

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'status': 'error',
            'error': 'bad_request',
            'message': 'Bad request'
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'status': 'error',
            'error': 'unauthorized',
            'message': 'Unauthorized'
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'status': 'error',
            'error': 'forbidden',
            'message': 'Forbidden'
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'status': 'error',
            'error': 'not_found',
            'message': 'Resource not found'
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'status': 'error',
            'error': 'method_not_allowed',
            'message': 'Method not allowed'
        }), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        print(f"Internal server error: {error}")
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'error': 'server_error',
            'message': 'Internal server error'
        }), 500

    @app.errorhandler(Exception)
    def handle_exception(error):
        print(f"Unhandled exception: {error}")
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'error': 'server_error',
            'message': 'An unexpected error occurred'
        }), 500


if __name__ == '__main__':
    app = create_app()
    config = get_config()
    port = config.PORT
    host = config.HOST

    print(f"Starting BodhAI server on {host}:{port}")
    app.run(debug=config.DEBUG, host=host, port=port)
