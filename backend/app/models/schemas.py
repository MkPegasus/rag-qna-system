from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    EMPLOYEE = "EMPLOYEE"
    MANAGER = "MANAGER"
    DOCUMENT_MANAGER = "DOCUMENT_MANAGER"
    ADMIN = "ADMIN"

class AccessLevelEnum(str, Enum):
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    CONFIDENTIAL = "CONFIDENTIAL"
    SECRET = "SECRET"

# ===== AUTH =====
class UserRegister(BaseModel):
    nom: str
    prenom: str
    email: str
    password: str
    role: RoleEnum = RoleEnum.EMPLOYEE

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    nom: str
    prenom: str
    email: str
    role: RoleEnum

    class Config:
        from_attributes = True

# ===== DOCUMENTS =====
class DocumentUpload(BaseModel):
    department: Optional[str] = None
    access_level: AccessLevelEnum = AccessLevelEnum.PUBLIC

class DocumentResponse(BaseModel):
    id: str
    titre: str
    extension: str
    department: Optional[str]
    access_level: AccessLevelEnum
    chunks_indexed: int
    message: str

class DocumentListItem(BaseModel):
    id: str
    titre: str
    extension: str
    department: Optional[str]
    access_level: AccessLevelEnum
    taille: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

# ===== QUERY =====
class QueryRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None

class SourceNode(BaseModel):
    filename: str
    page: Optional[int] = None
    score: Optional[float] = None
    text_preview: str

class QueryResponse(BaseModel):
    question: str
    answer: str
    sources: List[SourceNode]
    response_time_ms: int
    conversation_id: str

# ===== CONVERSATIONS =====
class MessageResponse(BaseModel):
    id: str
    contenu: str
    role: str
    sources_json: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    date_debut: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

# ===== USERS (ADMIN) =====
class UserUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    role: Optional[RoleEnum] = None

# ===== AUDIT =====
class AuditLogResponse(BaseModel):
    id: str
    action: str
    detail: Optional[str]
    created_at: datetime
    user_id: Optional[str]

    class Config:
        from_attributes = True