from .prompt_builder import PromptBuilder

class MentorService:
    def __init__(self):
        self.prompt_builder = PromptBuilder()

    def get_mentor_response(self, mode, user_input, context):
        """
        Processes user input and context to generate a mentor response.
        For now, this returns a mock response.
        In the future, it will call Amazon Bedrock.
        """
        # Construct the prompt
        prompt = self.prompt_builder.build_prompt(mode, user_input, context)
        print(f"DEBUG: Constructing prompt for Bedrock: {prompt}")

        # Mocking Bedrock response
        mock_replies = {
            "learn": "Here is a clear explanation of your concept with examples. As a {} learner, you'll find this easy to grasp...".format(context.get('user_level', 'beginner')),
            "code": "I've analyzed your code. The error seems to be related to... Here's how to fix it...",
            "roadmap": "Based on your goals, here's a step-by-step learning plan designed specifically for you...",
            "productivity": "Here's a time-based study plan to help you stay focused and productive today..."
        }

        # Return the reply based on mode
        reply = mock_replies.get(mode, "I'm here to help with your learning journey. What would you like to know?")
        
        return {
            "reply": f"Mocked AI Response for {mode.capitalize()} Mode: {reply}"
        }

# Initializing a singleton instance
mentor_service = MentorService()
