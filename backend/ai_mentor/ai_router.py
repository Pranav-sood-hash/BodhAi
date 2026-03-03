from flask import Blueprint, request, jsonify
from .mentor_service import mentor_service

ai_router = Blueprint('ai_mentor', __name__)

@ai_router.route('/api/ai/mentor', methods=['POST'])
def mentor():
    """
    Handle user requests for the AI Mentor.
    Request Body:
    {
        "mode": "learn | code | roadmap | productivity",
        "user_input": "string",
        "context": {
            "user_level": "beginner | intermediate",
            "current_page": "learn | code | productivity"
        }
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400
        
    mode = data.get('mode', 'learn')
    user_input = data.get('user_input', '')
    context = data.get('context', {})
    
    # Process the request with the mentor service
    response = mentor_service.get_mentor_response(mode, user_input, context)
    
    return jsonify(response)
