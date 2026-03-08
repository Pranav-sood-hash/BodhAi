from .prompt_builder import PromptBuilder
import sys
import os
import logging

# Ensure the root backend directory is in the path for cross-module imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.bedrock_adapter import bedrock_adapter

logger = logging.getLogger(__name__)


class MentorService:
    def __init__(self):
        self.prompt_builder = PromptBuilder()
        self.bedrock_adapter = bedrock_adapter

    def get_mentor_response(self, mode, user_input, context):
        """
        Processes user input and context to generate a mentor response
        using Amazon Bedrock with Claude 3 Haiku model.

        Args:
            mode: The mentor mode (learn, code, roadmap, productivity)
            user_input: The user's input/question
            context: Contextual information about the user

        Returns:
            Dictionary with 'reply' key containing the mentor's response
        """
        try:
            # Build structured prompt based on mode
            prompt = self.prompt_builder.build_prompt(mode, user_input, context)

            logger.info(f"Mentor mode: {mode}")

            # Invoke Bedrock with unified adapter
            response = self.bedrock_adapter.invoke_model(prompt)

            if response.get('success'):
                return {
                    "reply": response['reply'],
                    "model": response.get('model'),
                    "usage": response.get('usage', {})
                }
            else:
                # Return fallback message on failure
                return {
                    "reply": response['reply'],
                    "model": response.get('model'),
                    "error": response.get('error')
                }

        except Exception as e:
            logger.error(f"Error in get_mentor_response: {e}")
            return {
                "reply": "AI Mentor encountered an error. Please try again.",
                "error": str(e)
            }


# Initializing a singleton instance
mentor_service = MentorService()
