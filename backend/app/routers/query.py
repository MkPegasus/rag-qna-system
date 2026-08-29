"""
routers/query.py
Endpoints pour poser des questions et consulter l'historique.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.db_models import RoleEnum
from app.database import get_db
from app.dependencies import get_authenticated_user
from app.models.db_models import User
from app.models.schemas import QueryRequest, QueryResponse, ConversationResponse
from app.services import rag_service
from app.models.schemas import MessageResponse
from app.services.audit_service import log_action, AuditAction

router = APIRouter(prefix="/api/chat", tags=["Chat / RAG"])


@router.post("/ask", response_model=QueryResponse)
def ask(
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    result = rag_service.query_documents(
        question=request.question,
        user_id=str(current_user.id),
        user_role=RoleEnum(current_user.role),
        db=db,
        conversation_id=request.conversation_id,
    )
    return result


@router.get("/history", response_model=list[ConversationResponse])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    return rag_service.get_conversations(str(current_user.id), db)


@router.get("/history/{conversation_id}", response_model=list[MessageResponse])
def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    return rag_service.get_conversation_messages(
        conversation_id, str(current_user.id), db
    )