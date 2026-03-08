import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db import init_db, create_tables
from app.models.user_model import User
from app.models.learning_model import Roadmap, RoadmapPhase, Topic
import uuid

def seed_database():
    print("Initializing database...")
    engine, SessionLocal = init_db()
    create_tables(engine)
    session = SessionLocal()

    # Check if admin user exists
    admin_email = 'admin@bodhai.com'
    admin = session.query(User).filter_by(email=admin_email).first()
    if not admin:
        print(f"Creating admin user: {admin_email}")
        admin = User(
            id='mock-user-id', # Match the mock ID from auth_routes
            email=admin_email,
            password_hash='pbkdf2:sha256:260000$...', # dummy
            first_name='Admin',
            last_name='User',
            role='admin',
            is_verified=True
        )
        session.add(admin)

    # Check if we already have roadmaps
    if session.query(Roadmap).count() == 0:
        print("Creating sample roadmaps...")
        
        # Python Fundamentals Roadmap
        python_roadmap = Roadmap(
            id=str(uuid.uuid4()),
            title="Python Fundamentals",
            description="Master the basics of Python programming, from variables to object-oriented programming.",
            level="Beginner",
            duration="12 hours",
            track="backend",
            is_custom=False
        )
        session.add(python_roadmap)
        
        phase1 = RoadmapPhase(id=str(uuid.uuid4()), roadmap=python_roadmap, title="Introduction & Basics", order=1)
        phase2 = RoadmapPhase(id=str(uuid.uuid4()), roadmap=python_roadmap, title="Data Structures", order=2)
        session.add_all([phase1, phase2])
        
        t1 = Topic(id=str(uuid.uuid4()), phase=phase1, title="Python Installation & Setup", description="Set up your development environment.", order=1, estimated_time="30 mins")
        t2 = Topic(id=str(uuid.uuid4()), phase=phase1, title="Variables & Data Types", description="Learn about integers, strings, and booleans.", order=2, estimated_time="45 mins")
        t3 = Topic(id=str(uuid.uuid4()), phase=phase2, title="Lists & Tuples", description="Working with collections of data.", order=1, estimated_time="1 hour")
        session.add_all([t1, t2, t3])

        # Web Development Roadmap
        web_roadmap = Roadmap(
            id=str(uuid.uuid4()),
            title="Modern React Development",
            description="Learn to build modern, interactive user interfaces with React.",
            level="Intermediate",
            duration="24 hours",
            track="frontend",
            is_custom=False
        )
        session.add(web_roadmap)
        
        w_phase1 = RoadmapPhase(id=str(uuid.uuid4()), roadmap=web_roadmap, title="React Core Concepts", order=1)
        session.add(w_phase1)
        
        wt1 = Topic(id=str(uuid.uuid4()), phase=w_phase1, title="JSX & Components", description="The building blocks of React.", order=1, estimated_time="2 hours")
        wt2 = Topic(id=str(uuid.uuid4()), phase=w_phase1, title="Hooks: useState & useEffect", description="Managing state and side effects.", order=2, estimated_time="3 hours")
        session.add_all([wt1, wt2])

    session.commit()
    session.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()
