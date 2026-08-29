from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # vérifie la connexion avant chaque requête
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dépendance FastAPI : fournit une session DB par requête,
    et la ferme automatiquement après.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()