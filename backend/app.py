"""
BodhAI Backend Application Entry Point

This is the main Flask application server. It initializes the Flask app with:
- CORS enabled for frontend communication
- Route blueprints registered with /api prefix
- Database initialization
- Error handling and logging
"""

from run import create_app
from config import get_config
from ai_mentor.ai_router import ai_bp

if __name__ == '__main__':
    # Create Flask app
    app = create_app()

    # AI Mentor Registration
    if 'ai_mentor' not in app.blueprints:
        app.register_blueprint(ai_bp, url_prefix="/api/ai")

    config = get_config()
    port = config.PORT
    host = config.HOST
    
    print(f"\n{'='*60}")
    print(f"Starting BodhAI Backend Server")
    print(f"{'='*60}")
    print(f"Server: http://{host}:{port}")
    print(f"Environment: {config.__class__.__name__}")
    print(f"Debug Mode: {config.DEBUG}")
    print(f"{'='*60}\n")
    
    # Start Flask development server
    app.run(debug=config.DEBUG, host=host, port=port)
