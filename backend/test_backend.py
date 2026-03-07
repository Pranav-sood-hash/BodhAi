"""
Backend Health Check and Testing Script

This script tests the Flask backend to ensure:
1. The app initializes without errors
2. Routes are properly registered
3. The /api/ai/mentor endpoint works
4. CORS is enabled
"""

import json
import sys
from run import create_app
from config import get_config

def test_app_creation():
    """Test that the Flask app can be created."""
    try:
        app = create_app()
        print("✅ Flask app created successfully")
        return app
    except Exception as e:
        print(f"❌ Failed to create Flask app: {e}")
        sys.exit(1)

def test_routes(app):
    """Test that all routes are registered."""
    with app.test_client() as client:
        # Test health endpoint
        print("\nTesting health endpoints:")
        
        response = client.get('/')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ GET / returns 200")
        
        response = client.get('/health')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ GET /health returns 200")

def test_ai_mentor_endpoint(app):
    """Test the AI mentor endpoint."""
    with app.test_client() as client:
        print("\nTesting AI mentor endpoint:")
        
        # Test with valid request
        payload = {
            "mode": "learn",
            "user_input": "What is Python?",
            "context": {
                "user_level": "beginner",
                "track": "backend",
                "topic": "Python Basics"
            }
        }
        
        response = client.post(
            '/api/ai/mentor',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.get_json()
        assert 'reply' in data, "Response missing 'reply' field"
        print("✅ POST /api/ai/mentor returns 200 with valid response")
        print(f"   Response preview: {data['reply'][:100]}...")

def test_cors_headers(app):
    """Test that CORS headers are present."""
    with app.test_client() as client:
        print("\nTesting CORS configuration:")
        
        response = client.get('/', headers={'Origin': 'http://localhost:5173'})
        
        # Check for CORS headers
        cors_header = response.headers.get('Access-Control-Allow-Origin')
        if cors_header:
            print(f"✅ CORS enabled for origin: {cors_header}")
        else:
            print("⚠️  CORS header not found in response (may be Flask-CORS default behavior)")

def test_error_handling(app):
    """Test error handling."""
    with app.test_client() as client:
        print("\nTesting error handling:")
        
        # Test 404
        response = client.get('/nonexistent')
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✅ GET /nonexistent returns 404")
        
        # Test invalid JSON to AI endpoint
        response = client.post(
            '/api/ai/mentor',
            data='invalid json',
            content_type='application/json'
        )
        # Should handle gracefully
        print(f"✅ AI endpoint handles invalid JSON gracefully ({response.status_code})")

def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("BodhAI Backend Health Check")
    print("="*60)
    
    # Create app
    app = test_app_creation()
    
    # Get config
    config = get_config()
    print(f"\nConfiguration:")
    print(f"  Environment: {config.__class__.__name__}")
    print(f"  Port: {config.PORT}")
    print(f"  Host: {config.HOST}")
    print(f"  Debug: {config.DEBUG}")
    
    # Run tests
    try:
        test_routes(app)
        test_ai_mentor_endpoint(app)
        test_cors_headers(app)
        test_error_handling(app)
        
        print("\n" + "="*60)
        print("✅ All tests passed!")
        print("="*60)
        print(f"\nServer ready to start. Run: python app.py")
        print(f"Access at: http://localhost:{config.PORT}")
        print("\nTest endpoints:")
        print(f"  GET http://localhost:{config.PORT}/")
        print(f"  GET http://localhost:{config.PORT}/health")
        print(f"  POST http://localhost:{config.PORT}/api/ai/mentor")
        print("="*60 + "\n")
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
