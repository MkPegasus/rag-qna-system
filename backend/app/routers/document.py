from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from typing import List, Optional
import os
import shutil

from app.models.schemas import DocumentResponse, DocumentListItem
from app.models.db_models import RoleEnum, AccessLevelEnum, Document
from app.services.ingestion_service import ingest_document, delete_document_from_index
from app.services.audit_service import log_action, AuditAction
from app.dependencies import get_authenticated_user
from app.models.db_models import User
from app.config import settings
from app.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


def require_roles(allowed: list):
    """
    Factory de dépendance RBAC.
    Exemple : Depends(require_roles([RoleEnum.ADMIN, RoleEnum.DOCUMENT_MANAGER]))
    """
    def checker(current_user: User = Depends(get_authenticated_user)):
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=403,
                detail=f"Accès réservé aux rôles : {[r.value for r in allowed]}"
            )
        return current_user
    return checker


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    department: Optional[str] = Form(None),
    access_level: AccessLevelEnum = Form(AccessLevelEnum.PUBLIC),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([RoleEnum.DOCUMENT_MANAGER, RoleEnum.ADMIN])
    ),
):
    # 1. Vérifier l'extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Format non supporté. Formats acceptés : {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. Sauvegarder le fichier sur disque (votre logique conservée)
    filename = file.filename or "document_inconnu"
    file_path = os.path.join(settings.DOCUMENTS_PATH, filename)
    os.makedirs(settings.DOCUMENTS_PATH, exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 3. Indexer avec les métadonnées d'accès
    try:
        result = await ingest_document(
            file_path=file_path,
            filename=filename,
            department=department,
            access_level=access_level,
            uploaded_by=str(current_user.id),
            db=db,
        )
    except Exception as e:
        os.remove(file_path)   # votre logique de nettoyage conservée
        raise HTTPException(status_code=500, detail=f"Erreur d'indexation : {str(e)}")

    log_action(db, AuditAction.DOCUMENT_UPLOAD, user_id=str(current_user.id),
               detail={"filename": filename, "access_level": access_level.value})

    return DocumentResponse(**result)


@router.get("/", response_model=List[DocumentListItem])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_authenticated_user),
):
    """
    Filtre les documents selon le rôle de l'utilisateur :
    EMPLOYEE         → PUBLIC seulement
    MANAGER          → PUBLIC + INTERNAL
    DOCUMENT_MANAGER → PUBLIC + INTERNAL + CONFIDENTIAL
    ADMIN            → tout
    """
    ACCESS_FILTER = {
        RoleEnum.EMPLOYEE:         [AccessLevelEnum.PUBLIC],
        RoleEnum.MANAGER:          [AccessLevelEnum.PUBLIC, AccessLevelEnum.INTERNAL],
        RoleEnum.DOCUMENT_MANAGER: [AccessLevelEnum.PUBLIC, AccessLevelEnum.INTERNAL,
                                    AccessLevelEnum.CONFIDENTIAL],
        RoleEnum.ADMIN:            list(AccessLevelEnum),
    }
    allowed = ACCESS_FILTER.get(RoleEnum(current_user.role), [AccessLevelEnum.PUBLIC])

    docs = db.query(Document).filter(Document.access_level.in_(allowed)).all()

    log_action(db, AuditAction.DOCUMENT_LIST, user_id=str(current_user.id))
    return docs


@router.delete("/{doc_id}", status_code=200)
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([RoleEnum.DOCUMENT_MANAGER, RoleEnum.ADMIN])
    ),
):
    """Supprime le document de MySQL + ChromaDB + disque."""
    delete_document_from_index(doc_id, db)
    log_action(db, AuditAction.DOCUMENT_DELETE, user_id=str(current_user.id),
               detail={"doc_id": doc_id})
    return {"message": "Document supprimé avec succès"}