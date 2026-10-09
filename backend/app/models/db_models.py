from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.database import Base
import uuid
import enum

def generate_uuid():
    return str(uuid.uuid4())

class RoleEnum(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"
    DOCUMENT_MANAGER = "DOCUMENT_MANAGER"
    ADMIN = "ADMIN"

class AccessLevelEnum(str, enum.Enum):
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    CONFIDENTIAL = "CONFIDENTIAL"
    SECRET = "SECRET"

# ===== USER =====
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.EMPLOYEE, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relations vers les autres tables
    documents = relationship("Document", back_populates="uploaded_by_user")
    conversations = relationship("Conversation", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

# ===== DOCUMENT =====
class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    titre = Column(String(255), nullable=False)
    extension = Column(String(10), nullable=False)
    chemin_fichier = Column(String(500), nullable=False)
    department = Column(String(100), nullable=True)
    access_level = Column(Enum(AccessLevelEnum), default=AccessLevelEnum.PUBLIC)
    uploaded_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    taille = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    uploaded_by_user = relationship("User", back_populates="documents")

# ===== DOCUMENT CHUNK (vecteurs) =====
class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    doc_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    access_level = Column(Enum(AccessLevelEnum), nullable=False, index=True)
    department = Column(String(100), nullable=True)
    filename = Column(String(255), nullable=True)
    page_label = Column(String(50), nullable=True)
    embedding = Column(Vector(3072), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

# ===== CONVERSATION =====
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    date_debut = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")

# ===== MESSAGE =====
class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    contenu = Column(Text, nullable=False)
    role = Column(String(20), nullable=False)
    sources_json = Column(Text, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")

# ===== AUDIT LOG =====
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="audit_logs")