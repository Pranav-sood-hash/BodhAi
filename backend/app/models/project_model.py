from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, ForeignKey
from database.db import Base
from datetime import datetime
import uuid

class Project(Base):
    """Project model for user code projects."""
    
    __tablename__ = 'projects'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False, index=True)
    
    # Project information
    title = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Project metadata
    language = Column(String(50))  # Python, JavaScript, Java, etc.
    framework = Column(String(100))  # Flask, React, Django, etc.
    learning_track = Column(String(100))  # backend, frontend, ai, fullstack
    
    # Project status
    status = Column(String(50), default='in_progress')  # in_progress, completed, archived
    difficulty = Column(String(50), default='beginner')  # beginner, intermediate, advanced
    
    # Project content
    code_snippet = Column(Text)  # For storing code for analysis
    requirements = Column(Text)  # Project requirements or goals
    
    # Project metrics
    total_commits = Column(Integer, default=0)
    last_modified = Column(DateTime, default=datetime.utcnow)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Learning context
    topic = Column(String(100))  # Related learning topic
    
    def __repr__(self):
        return f"<Project {self.title}>"
    
    def to_dict(self):
        """Convert project to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'language': self.language,
            'framework': self.framework,
            'learning_track': self.learning_track,
            'status': self.status,
            'difficulty': self.difficulty,
            'code_snippet': self.code_snippet,
            'requirements': self.requirements,
            'total_commits': self.total_commits,
            'last_modified': self.last_modified.isoformat() if self.last_modified else None,
            'topic': self.topic,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
