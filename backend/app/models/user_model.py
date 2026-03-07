from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from database.db import Base
from datetime import datetime
import uuid

class User(Base):
    """User model for storing user information."""
    
    __tablename__ = 'users'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Learning preferences
    skill_level = Column(String(50), default='beginner')  # beginner, intermediate, advanced
    learning_track = Column(String(100), default='backend')  # backend, frontend, ai, fullstack
    
    # Profile information
    avatar_url = Column(Text)
    bio = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    
    def __repr__(self):
        return f"<User {self.email}>"
    
    def to_dict(self):
        """Convert user to dictionary."""
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_verified': self.is_verified,
            'is_active': self.is_active,
            'skill_level': self.skill_level,
            'learning_track': self.learning_track,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class OTPToken(Base):
    """OTP token model for email verification and password reset."""
    
    __tablename__ = 'otp_tokens'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), nullable=False, index=True)
    otp_code = Column(String(10), nullable=False)
    purpose = Column(String(50), nullable=False)  # 'verification', 'password_reset'
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<OTPToken {self.email}>"
    
    def is_expired(self):
        """Check if OTP is expired."""
        return datetime.utcnow() > self.expires_at
