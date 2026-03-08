from flask import Blueprint, request, jsonify, current_app
from app.utils import success_response, error_response, require_auth, not_found_response
from app.models.learning_model import Roadmap, RoadmapPhase, Topic, LearningProgress
from ai_mentor.mentor_service import mentor_service
from datetime import datetime
import uuid
import re

learning_routes = Blueprint('learning', __name__, url_prefix='/api/learning')

@learning_routes.route('/roadmaps', methods=['GET'])
@require_auth
def get_roadmaps():
    """Get all learning roadmaps (system + user's custom ones)."""
    try:
        session = current_app.SessionLocal()
        user_id = request.user_id
        
        # Get system roadmaps (user_id is null) and user's custom ones
        roadmaps = session.query(Roadmap).filter(
            (Roadmap.user_id == None) | (Roadmap.user_id == user_id)
        ).all()
        
        roadmap_list = []
        for roadmap in roadmaps:
            # Calculate progress for this roadmap
            phases = session.query(RoadmapPhase).filter_by(roadmap_id=roadmap.id).all()
            phase_ids = [p.id for p in phases]
            topics = session.query(Topic).filter(Topic.phase_id.in_(phase_ids)).all()
            topic_ids = [t.id for t in topics]
            
            completed_topics = 0
            if topic_ids:
                completed_topics = session.query(LearningProgress).filter(
                    LearningProgress.user_id == user_id,
                    LearningProgress.topic_id.in_(topic_ids),
                    LearningProgress.completed == True
                ).count()
                
            progress = (completed_topics / len(topics) * 100) if topics else 0
            
            roadmap_data = {
                'id': roadmap.id,
                'title': roadmap.title,
                'level': roadmap.level,
                'duration': roadmap.duration,
                'progress': round(progress, 1),
                'track': roadmap.track,
                'is_custom': roadmap.is_custom
            }
            roadmap_list.append(roadmap_data)
            
        session.close()
        return success_response(roadmap_list, 'Roadmaps retrieved successfully', 200)
    
    except Exception as e:
        print(f"Get roadmaps error: {e}")
        return error_response('server_error', str(e), 500)

@learning_routes.route('/roadmap/<roadmap_id>', methods=['GET'])
@require_auth
def get_roadmap_detail(roadmap_id):
    """Get detailed roadmap including phases and topics."""
    try:
        session = current_app.SessionLocal()
        roadmap = session.query(Roadmap).filter_by(id=roadmap_id).first()
        
        if not roadmap:
            session.close()
            return not_found_response('Roadmap')
            
        user_id = request.user_id
        data = roadmap.to_dict()
        
        # Add progress information for each topic
        for phase in data['phases']:
            for topic in phase['topics']:
                progress = session.query(LearningProgress).filter_by(
                    user_id=user_id,
                    topic_id=topic['id']
                ).first()
                topic['completed'] = progress.completed if progress else False
                
        session.close()
        return success_response(data, 'Roadmap details retrieved successfully', 200)
        
    except Exception as e:
        print(f"Get roadmap detail error: {e}")
        return error_response('server_error', str(e), 500)

@learning_routes.route('/progress', methods=['POST'])
@require_auth
def update_progress():
    """Update learning progress for a topic."""
    try:
        data = request.get_json()
        if not data:
            return error_response('invalid_request', 'No JSON data provided', 400)
            
        topic_id = data.get('topic_id')
        completed = data.get('completed', False)
        user_id = request.user_id
        
        if not topic_id:
            return error_response('validation_error', 'topic_id is required', 422)
            
        session = current_app.SessionLocal()
        
        # Check if progress exists
        progress = session.query(LearningProgress).filter_by(
            user_id=user_id,
            topic_id=topic_id
        ).first()
        
        if progress:
            progress.completed = completed
            if completed:
                progress.completed_at = datetime.utcnow()
        else:
            progress = LearningProgress(
                user_id=user_id,
                topic_id=topic_id,
                completed=completed,
                completed_at=datetime.utcnow() if completed else None
            )
            session.add(progress)
            
        session.commit()
        progress_dict = progress.to_dict()
        session.close()
        
        return success_response(progress_dict, 'Progress updated successfully', 200)
        
    except Exception as e:
        print(f"Update progress error: {e}")
        return error_response('server_error', str(e), 500)

@learning_routes.route('/dashboard', methods=['GET'])
@require_auth
def get_dashboard_stats():
    """Get summarized learning stats for the dashboard."""
    try:
        session = current_app.SessionLocal()
        user_id = request.user_id
        
        # Get active roadmaps (those where user has at least one topic in progress or completed)
        # For simplicity, just get all roadmaps user has access to
        roadmaps = session.query(Roadmap).filter(
            (Roadmap.user_id == None) | (Roadmap.user_id == user_id)
        ).all()
        
        active_roadmaps = []
        for roadmap in roadmaps:
            phases = session.query(RoadmapPhase).filter_by(roadmap_id=roadmap.id).all()
            phase_ids = [p.id for p in phases]
            topics = session.query(Topic).filter(Topic.phase_id.in_(phase_ids)).all()
            topic_ids = [t.id for t in topics]
            
            if not topic_ids:
                continue
                
            completed_topics_objs = session.query(LearningProgress).filter(
                LearningProgress.user_id == user_id,
                LearningProgress.topic_id.in_(topic_ids),
                LearningProgress.completed == True
            ).all()
            
            completed_count = len(completed_topics_objs)
            progress_pct = (completed_count / len(topics) * 100)
            
            if completed_count > 0:
                active_roadmaps.append({
                    'id': roadmap.id,
                    'title': roadmap.title,
                    'progress': round(progress_pct, 1),
                    'total_topics': len(topics),
                    'completed_topics': completed_count,
                    # Next topic to learn
                    'next_topic': next((t for t in sorted(topics, key=lambda x: x.order) 
                                     if not any(cp.topic_id == t.id for cp in completed_topics_objs)), None)
                })
        
        # Sort by progress (highest first but not 100% first)
        active_roadmaps.sort(key=lambda x: (x['progress'] < 100, x['progress']), reverse=True)
        
        current_roadmap = active_roadmaps[0] if active_roadmaps else None
        
        # Recommended next lesson
        recommended = None
        if current_roadmap and current_roadmap['next_topic']:
            recommended = {
                'id': current_roadmap['next_topic'].id,
                'title': current_roadmap['next_topic'].title,
                'roadmap_id': current_roadmap['id']
            }
            
        stats = {
            'current_roadmap': current_roadmap,
            'learning_streak': 5, # Mock for now
            'recommended_next_lesson': recommended,
            'total_completed_topics': session.query(LearningProgress).filter_by(user_id=user_id, completed=True).count()
        }
        
        session.close()
        return success_response(stats, 'Dashboard stats retrieved successfully', 200)
        
    except Exception as e:
        print(f"Get dashboard stats error: {e}")
        return error_response('server_error', str(e), 500)

def parse_roadmap_response(response_text, user_id):
    """Parses AI markdown response into a Roadmap object."""
    # This is a basic parser that looks for specific headers
    # A more robust one would use regex or better structure
    
    title_match = re.search(r'### 🗺 ROADMAP_TITLE\n(.*?)\n', response_text)
    title = title_match.group(1).strip() if title_match else "Custom Roadmap"
    
    metadata_match = re.search(r'### 📊 METADATA\n- Level: (.*?)\n- Estimated Duration: (.*?)\n- Track: (.*?)\n', response_text)
    level = metadata_match.group(1).strip() if metadata_match else "beginner"
    duration = metadata_match.group(2).strip() if metadata_match else "3 months"
    track = metadata_match.group(3).strip() if metadata_match else "backend"
    
    # Create Roadmap object
    roadmap = Roadmap(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=title,
        level=level,
        duration=duration,
        track=track,
        is_custom=True
    )
    
    # Extract phases
    phase_pattern = r'#### Phase (\d+): (.*?)\n(.*?)(?=\n#### Phase|\n###|$)'
    phases = re.finditer(phase_pattern, response_text, re.DOTALL)
    
    roadmap_phases = []
    for match in phases:
        phase_num = int(match.group(1))
        phase_title = match.group(2).strip()
        phase_content = match.group(3).strip()
        
        phase = RoadmapPhase(
            id=str(uuid.uuid4()),
            title=phase_title,
            order=phase_num
        )
        
        # Extract topics
        topic_pattern = r'- \*\*(.*?)\*\*: (.*?) \(Estimated: (.*?)\)'
        topics = re.finditer(topic_pattern, phase_content)
        
        for i, t_match in enumerate(topics):
            t_title = t_match.group(1).strip()
            t_desc = t_match.group(2).strip()
            t_time = t_match.group(3).strip()
            
            topic = Topic(
                id=str(uuid.uuid4()),
                title=t_title,
                description=t_desc,
                estimated_time=t_time,
                order=i+1
            )
            phase.topics.append(topic)
            
        roadmap.phases.append(phase)
        
    return roadmap

@learning_routes.route('/roadmaps/generate', methods=['POST'])
@require_auth
def generate_roadmap():
    """Generates a custom roadmap using AI and saves it."""
    try:
        data = request.get_json()
        if not data:
            return error_response('invalid_request', 'No JSON data provided', 400)
            
        goal = data.get('goal', 'Software Engineering')
        level = data.get('level', 'beginner')
        technology = data.get('technology', 'any')
        timeline = data.get('timeline', '3 months')
        
        user_id = request.user_id
        
        # Call AI Mentor
        response = mentor_service.get_mentor_response(
            mode='roadmap',
            user_input=f"Create a roadmap for {goal}",
            context={
                'goal': goal,
                'level': level,
                'technology': technology,
                'timeline': timeline
            }
        )
        
        ai_reply = response.get('reply', '')
        if not ai_reply or "AI Mentor is temporarily unavailable" in ai_reply:
            # Fallback mock for demo purposes when AI is unavailable
            ai_reply = f"""
### 🗺 ROADMAP_TITLE
{goal} Path

### 📊 METADATA
- Level: {level}
- Estimated Duration: {timeline}
- Track: backend

### 📍 PHASES

#### Phase 1: Foundations
- **Getting Started**: Introduction to {technology} and core concepts (Estimated: 2 hours)
- **Setup**: Configuring your development environment (Estimated: 1 hour)
- **Basic Syntax**: Learning the fundamentals (Estimated: 4 hours)
- Phase Project: Initial Setup & Basic App

#### Phase 2: Intermediate Concepts
- **Advanced Topics**: Deep dive into {technology} features (Estimated: 6 hours)
- **Best Practices**: Writing clean and efficient code (Estimated: 3 hours)
- Phase Project: Feature-rich Application

### 🚀 CAPSTONE_PROJECT
Final Project: A production-ready {goal} application.
"""

        # Parse and save
        roadmap = parse_roadmap_response(ai_reply, user_id)
        
        session = current_app.SessionLocal()
        session.add(roadmap)
        session.commit()
        roadmap_dict = roadmap.to_dict()
        session.close()
        
        return success_response(roadmap_dict, 'Roadmap generated and saved successfully', 201)
        
    except Exception as e:
        print(f"Generate roadmap error: {e}")
        return error_response('server_error', str(e), 500)
