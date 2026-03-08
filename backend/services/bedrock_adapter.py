import boto3
import json
import logging
from typing import Dict, Any, Optional
from config import Config

logger = logging.getLogger(__name__)


class BedrockAdapter:
    """
    Unified adapter for Amazon Bedrock integration with Claude 3 Haiku model.
    Handles request/response formatting and error handling.
    """
    
    # Bedrock model configuration
    BEDROCK_MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0"
    ANTHROPIC_VERSION = "bedrock-2023-06-01"
    
    def __init__(self):
        """Initialize Bedrock adapter with AWS credentials from config."""
        self.bedrock_client = None
        self.enabled = False
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Bedrock client using AWS credentials from environment."""
        try:
            if Config.AWS_ACCESS_KEY_ID and Config.AWS_SECRET_ACCESS_KEY:
                self.bedrock_client = boto3.client(
                    'bedrock-runtime',
                    region_name=Config.AWS_REGION or 'us-east-1',
                    aws_access_key_id=Config.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=Config.AWS_SECRET_ACCESS_KEY
                )
                self.enabled = True
                logger.info("Bedrock client initialized successfully")
            else:
                logger.warning("AWS credentials not configured. Bedrock will use fallback responses.")
                self.enabled = False
        except Exception as e:
            logger.error(f"Failed to initialize Bedrock client: {e}")
            self.enabled = False
    
    def invoke_model(self, prompt: str) -> Dict[str, Any]:
        """
        Invoke Claude 3 Haiku model via Bedrock.
        
        Args:
            prompt: The prompt to send to the model
        
        Returns:
            Dictionary with 'success', 'reply', and optional 'error' keys
        """
        if not self.enabled or not self.bedrock_client:
            logger.warning("Bedrock not available, using fallback response")
            return self._fallback_response(prompt)
        
        try:
            logger.info(f"Invoking Bedrock model: {self.BEDROCK_MODEL_ID}")
            logger.debug(f"Prompt: {prompt[:200]}...")  # Log first 200 chars
            
            # Build request using Claude 3 Messages API format
            request_body = {
                "anthropic_version": self.ANTHROPIC_VERSION,
                "max_tokens": 2048,
                "temperature": 0.5,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            # Invoke the model
            response = self.bedrock_client.invoke_model(
                modelId=self.BEDROCK_MODEL_ID,
                body=json.dumps(request_body),
                accept="application/json",
                contentType="application/json"
            )
            
            # Parse response
            response_body = json.loads(response['body'].read())
            
            # Extract text from Claude 3 response format
            if 'content' in response_body and len(response_body['content']) > 0:
                reply = response_body['content'][0].get('text', '')
                if reply:
                    logger.info(f"Successfully received response from Bedrock")
                    return {
                        'success': True,
                        'reply': reply,
                        'model': self.BEDROCK_MODEL_ID,
                        'usage': response_body.get('usage', {})
                    }
            
            logger.warning("No content in Bedrock response")
            return self._fallback_response(prompt)
            
        except Exception as e:
            logger.error(f"Error invoking Bedrock: {e}")
            return self._fallback_response(prompt)
    
    def _fallback_response(self, prompt: str) -> Dict[str, Any]:
        """
        Return a fallback response when Bedrock is unavailable.
        Useful for development and testing.
        
        Args:
            prompt: The original prompt
        
        Returns:
            Dictionary with fallback response
        """
        return {
            'success': False,
            'reply': "AI Mentor is temporarily unavailable. Please try again later.",
            'error': 'Bedrock service unavailable',
            'model': self.BEDROCK_MODEL_ID
        }
    
    def is_available(self) -> bool:
        """Check if Bedrock service is available."""
        return self.enabled and self.bedrock_client is not None


# Initialize singleton adapter instance
bedrock_adapter = BedrockAdapter()
