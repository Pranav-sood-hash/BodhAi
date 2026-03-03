from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/bodhai')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    
    from app.routes import main
    app.register_blueprint(main)

    from ai_mentor.ai_router import ai_router
    app.register_blueprint(ai_router)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5001)
