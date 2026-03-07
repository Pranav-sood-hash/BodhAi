import boto3
import os
import json
from typing import Dict, Any, Optional
from config import Config

class AIService:
    """Service for interacting with AI models (Bedrock, etc.)."""
    
    def __init__(self):
        """Initialize AI service with AWS configuration."""
        self.bedrock_client = None
        self.use_bedrock = os.getenv('USE_BEDROCK', 'false').lower() == 'true'
        
        if self.use_bedrock:
            self._init_bedrock()
    
    def _init_bedrock(self):
        """Initialize Bedrock client."""
        try:
            self.bedrock_client = boto3.client(
                'bedrock-runtime',
                region_name=Config.AWS_REGION,
                aws_access_key_id=Config.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=Config.AWS_SECRET_ACCESS_KEY
            )
        except Exception as e:
            print(f"Warning: Could not initialize Bedrock client: {e}")
            self.bedrock_client = None
    
    def call_bedrock(self, prompt: str, model_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Call Bedrock API with a prompt.
        
        Args:
            prompt: The prompt to send to the model
            model_id: Optional model ID (defaults to Claude 3 Sonnet)
        
        Returns:
            Response from Bedrock
        """
        if not self.bedrock_client:
            return self._fallback_response(prompt)
        
        if model_id is None:
            model_id = Config.BEDROCK_MODEL_ID
        
        try:
            # Prepare request for Claude 3
            request_body = {
                "anthropic_version": "bedrock-2023-06-01",
                "max_tokens": 2048,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            response = self.bedrock_client.invoke_model(
                modelId=model_id,
                body=json.dumps(request_body)
            )
            
            response_body = json.loads(response['body'].read())
            
            # Extract text from response
            if 'content' in response_body and len(response_body['content']) > 0:
                return {
                    'success': True,
                    'reply': response_body['content'][0]['text'],
                    'model': model_id,
                    'usage': response_body.get('usage', {})
                }
            else:
                return {
                    'success': False,
                    'error': 'No content in Bedrock response',
                    'reply': self._fallback_response(prompt)['reply']
                }
        
        except Exception as e:
            print(f"Error calling Bedrock: {e}")
            return {
                'success': False,
                'error': str(e),
                'reply': self._fallback_response(prompt)['reply']
            }
    
    def _fallback_response(self, prompt: str) -> Dict[str, str]:
        """
        Provide a mock response when Bedrock is not available.
        This is useful for development and testing.
        """
        return {
            'success': True,
            'reply': f"Mock response: I received your request. In production, this would be processed by Bedrock. Original prompt length: {len(prompt)} characters."
        }
    
    def generate_response(self, prompt: str, use_bedrock: bool = None) -> Dict[str, Any]:
        """
        Generate a response using configured AI service.
        
        Args:
            prompt: The prompt to process
            use_bedrock: Optional override to use/skip Bedrock
        
        Returns:
            Response dictionary with 'reply' and 'success' keys
        """
        if use_bedrock is None:
            use_bedrock = self.use_bedrock
        
        if use_bedrock and self.bedrock_client:
            return self.call_bedrock(prompt)
        else:
            return self._fallback_response(prompt)


# Initialize singleton instance
ai_service = AIService()
