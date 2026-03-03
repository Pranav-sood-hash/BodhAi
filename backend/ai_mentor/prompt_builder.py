class PromptBuilder:
    @staticmethod
    def build_prompt(mode, user_input, context):
        user_level = context.get('user_level', 'beginner')
        current_page = context.get('current_page', 'unknown')
        
        if mode == 'learn':
            return f"""
                You are an expert AI Learning Mentor. 
                Mode: Learning Explanation
                Context: User is on {current_page} page and is a {user_level} level learner.
                Task: Explain the following concept clearly with examples.
                User Query: {user_input}
            """
        elif mode == 'code':
            return f"""
                You are an expert AI Code Assistant.
                Mode: Code Analysis
                Context: User is on {current_page} page and is a {user_level} level learner.
                Task: Analyze the following code or error, explain it, and suggest a fix.
                User Query: {user_input}
            """
        elif mode == 'roadmap':
            return f"""
                You are an expert AI Career Coach.
                Mode: Roadmap Generation
                Context: User is on {current_page} page and is a {user_level} level learner.
                Task: Generate a step-by-step learning roadmap for the following goal.
                User Query: {user_input}
            """
        elif mode == 'productivity':
            return f"""
                You are an expert Productivity Coach.
                Mode: Study Planning
                Context: User is on {current_page} page and is a {user_level} level learner.
                Task: Create a time-based study plan or schedule based on the input.
                User Query: {user_input}
            """
        else:
            return f"Context: {context}. User Query: {user_input}"
