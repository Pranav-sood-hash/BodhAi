from .prompt_builder import PromptBuilder
import sys
import os

# Ensure the root backend directory is in the path for cross-module imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.bedrock_service import generate_bedrock_response

class MentorService:
    def __init__(self):
        self.prompt_builder = PromptBuilder()

    def get_mentor_response(self, mode, user_input, context):
        """
        Step 4: Processes user input and context to generate a mentor response 
        using Amazon Bedrock while preserving the existing architecture.
        """
        # Step 7: Preserve AI Mode Switching and Prompt Building
        # Construct the prompt using the existing prompt_builder
        prompt = self.prompt_builder.build_prompt(mode, user_input, context)
        
        # Step 4: Call Bedrock service
        reply = generate_bedrock_response(prompt)

        # Step 5: Add Fallback Mechanism
        if reply is None:
            reply = "AI Mentor is temporarily unavailable. Please try again."

        return {
            "reply": reply
        }

# Initializing a singleton instance
mentor_service = MentorService()
