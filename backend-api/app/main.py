from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config.settings import settings

# Database configuration
DATABASE_URL = settings.database_url

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=True)  # echo=True for debugging, set to False in production

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def main():
    print("Hello from backend-api/app/main.py")
    # Test database connection
    try:
        with engine.connect() as connection:
            print("Database connection successful!")
    except Exception as e:
        print(f"Database connection failed: {e}")

if __name__ == "__main__":
    main()
