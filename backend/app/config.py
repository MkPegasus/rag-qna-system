from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    APP_NAME: str = "RAG Q&A System"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Database
    DATABASE_URL: str

    # Groq
    GROQ_API_KEY: str
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    # Gemini (embeddings)
    GEMINI_API_KEY: str
    EMBED_MODEL: str = "gemini-embedding-001"

    # RAG
    DOCUMENTS_PATH: str = "./documents"
    TOP_K: int = 3
    SIMILARITY_THRESHOLD: float = 0.7

    # CORS
    FRONTEND_URL: str = "http://localhost:8080"

    class Config:
        env_file = ".env"

settings = Settings()