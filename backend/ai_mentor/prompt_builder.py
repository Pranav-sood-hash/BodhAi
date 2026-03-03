class PromptBuilder:
    @staticmethod
    def build_code_prompt(user_input, context):
        """
        Build a structured prompt for Code Assistant mode.

        Args:
            user_input: The code to analyze
            context: Dictionary containing code analysis parameters

        Returns:
            A structured prompt for code analysis
        """
        # Extract context with safe defaults
        code_mode = context.get('code_mode', 'Explain Code')
        language = context.get('language', 'Python')
        user_level = context.get('user_level', 'beginner')
        current_track = context.get('current_track', 'backend')

        # Build mode-specific instructions
        mode_instructions = {
            'Explain Code': """* Explain the logic step-by-step
   * Identify key functions and their purposes
   * Explain time/space complexity if relevant
   * Note any design patterns used""",
            'Debug Code': """* Identify logical and syntax errors
   * Explain why each error occurs
   * Provide a corrected version of the code
   * Explain the fix clearly""",
            'Optimize Code': """* Suggest performance improvements
   * Suggest readability and maintainability improvements
   * Provide an optimized version of the code
   * Explain the trade-offs of your suggestions"""
        }

        instructions = mode_instructions.get(code_mode, mode_instructions['Explain Code'])

        # Build the dynamic prompt
        prompt = f"""You are BodhAI — an expert software engineering mentor specializing in code analysis.

User Profile:
- Skill Level: {user_level}
- Programming Language: {language}
- Learning Track: {current_track}
- Task Type: {code_mode}

Code Provided:

{user_input}


Instructions for {code_mode}:

{instructions}

Response Format:

Please structure your response exactly as follows (use these headers):

### 🔍 Analysis
Provide a thorough analysis of the code.

### 🛠 Suggested Fix / Explanation
Provide the suggested changes or explanation.

### 🚀 Improvement Notes
Provide additional insights and recommendations.

Keep your response structured, clear, and mentor-like. Tailor the complexity level to a {user_level} developer."""

        return prompt

    @staticmethod
    def build_learn_prompt(user_input, context):
        """
        Build a dynamic, context-aware prompt for Learn mode.

        Args:
            user_input: The user's question or learning request
            context: Dictionary containing user profile information

        Returns:
            A structured prompt that adapts to the user's skill level, track, and topic
        """
        # Extract context with safe defaults
        name = context.get('name', 'Learner')
        level = context.get('level', context.get('user_level', 'beginner'))
        track = context.get('track', 'backend')
        topic = context.get('topic', 'general programming')
        progress = context.get('progress', 0)

        # Ensure progress is a valid number
        try:
            progress = int(progress) if progress else 0
        except (ValueError, TypeError):
            progress = 0

        # Build the dynamic prompt
        prompt = f"""You are BodhAI — an adaptive AI learning mentor.

User Profile:
- Name: {name}
- Skill Level: {level}
- Learning Track: {track}
- Current Topic: {topic}
- Progress: {progress}%

Teaching Guidelines:

1. Adapt explanation depth to skill level:
   * Beginner: Use simple language, analogies, and foundational concepts
   * Intermediate: Include practical examples, edge cases, and best practices
   * Advanced: Discuss optimization, design patterns, and deeper insights

2. Connect the explanation to their learning track ({track}):
   * frontend: Focus on UI, UX, performance, and browser concepts
   * backend: Focus on servers, databases, APIs, and scalability
   * ai: Focus on algorithms, models, data processing, and ML concepts
   * fullstack: Balance between frontend and backend integration

3. Assume the user is currently studying "{topic}"

4. Avoid generic textbook explanations. Make content relevant to their track and level.

User Question:
{user_input}

Response Format:

Please structure your response exactly as follows (use these headers):

### 📘 Concept Explanation
Provide a clear, level-appropriate explanation of the concept.

### 💻 Practical Example
Provide a code example or real-world use case relevant to their {track} track.

### 🧠 Why This Matters
Explain how this concept fits into their learning path and why it's important for {track} development.

### 🧪 Practice Task
Give one short, actionable practice task aligned with their {level} skill level.

### 🚀 Suggested Next Topic
Suggest the next logical topic to learn based on "{topic}".

Keep your response structured, clear, and mentor-like."""

        return prompt

    @staticmethod
    def build_prompt(mode, user_input, context):
        """
        Main prompt builder that routes to appropriate builders based on mode.
        """
        user_level = context.get('user_level', 'beginner')
        current_page = context.get('current_page', 'unknown')

        if mode == 'learn':
            # Use the new dynamic learn prompt builder
            return PromptBuilder.build_learn_prompt(user_input, context)
        elif mode == 'code':
            # Use the new structured code prompt builder
            return PromptBuilder.build_code_prompt(user_input, context)
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
