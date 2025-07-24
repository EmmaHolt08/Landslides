# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from the .env file at the project root
load_dotenv()

# Get the database URL from the environment variable
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Basic error handling if the URL isn't set
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set. Please check your .env file.")

# Create the SQLAlchemy engine. This is the main interface to your database.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a SessionLocal class. Each instance of SessionLocal will be a database session.
# autocommit=False ensures transactions are managed manually (you commit changes).
# autoflush=False prevents automatic flushing, giving you more control.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our SQLAlchemy models.
Base = declarative_base()

# Dependency function for FastAPI to get a database session for each request.
# The 'yield' keyword makes it a context manager, ensuring the session is closed.
def get_db():
    db = SessionLocal() # Create a new session
    try:
        yield db        # Yield the session to the FastAPI endpoint
    finally:
        db.close()      # Ensure the session is closed after the request is done