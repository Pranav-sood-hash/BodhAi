from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool
import os

# Create base class for models
Base = declarative_base()

def get_database_url():
    """Get database URL from environment or use SQLite."""
    db_url = os.getenv('DATABASE_URL', 'sqlite:///bodhai.db')
    # Handle SQLite paths
    if db_url == 'sqlite:///bodhai.db':
        # Ensure database file is in the backend directory
        db_path = os.path.join(os.path.dirname(__file__), '..', 'bodhai.db')
        return f'sqlite:///{db_path}'
    return db_url

def init_db(app=None):
    """Initialize database with SQLAlchemy."""
    db_url = get_database_url()
    
    # Use StaticPool for SQLite to avoid threading issues
    if 'sqlite' in db_url:
        engine = create_engine(
            db_url,
            connect_args={'check_same_thread': False},
            poolclass=StaticPool,
            echo=os.getenv('SQL_ECHO', 'False').lower() == 'true'
        )
    else:
        engine = create_engine(
            db_url,
            echo=os.getenv('SQL_ECHO', 'False').lower() == 'true'
        )
    
    return engine, sessionmaker(bind=engine)

def create_tables(engine):
    """Create all tables from models."""
    Base.metadata.create_all(engine)

def drop_tables(engine):
    """Drop all tables (use with caution)."""
    Base.metadata.drop_all(engine)

def table_exists(engine, table_name):
    """Check if a table exists in the database."""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()
