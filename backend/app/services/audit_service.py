"""
audit_service.py
Enregistre chaque action importante dans audit_logs.
Appelé depuis les routers après chaque opération sensible.
"""
import json
from sqlalchemy.orm import Session
from app.models.db_models import AuditLog

# Constantes d'actions → évite les fautes de frappe partout dans le code
class AuditAction:
    LOGIN           = "LOGIN"
    REGISTER        = "REGISTER"
    DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD"
    DOCUMENT_DELETE = "DOCUMENT_DELETE"
    DOCUMENT_LIST   = "DOCUMENT_LIST"
    QUERY_ASK       = "QUERY_ASK"
    HISTORY_READ    = "HISTORY_READ"
    USER_CREATE     = "USER_CREATE"
    USER_UPDATE     = "USER_UPDATE"
    USER_DELETE     = "USER_DELETE"
    USER_LIST       = "USER_LIST"
    REINDEX         = "REINDEX"
    
from typing import Optional, Union

def log_action(
    db: Session,
    action: str,
    user_id: Optional[str] = None,
    detail: Optional[Union[dict, str]] = None,
) -> None:
    """
    Insère une ligne dans audit_logs.
    Ne lève jamais d'exception : un échec de log ne doit pas
    bloquer la requête principale.
    """
    if isinstance(detail, dict):
        detail_str = json.dumps(detail, ensure_ascii=False)
    else:
        detail_str = str(detail) if detail else None

    entry = AuditLog(
        user_id=user_id,
        action=action,
        detail=detail_str,
    )
    try:
        db.add(entry)
        db.commit()
    except Exception as exc:
        db.rollback()
        print(f"[AUDIT] Échec log : {exc}")


def get_audit_logs(
    db: Session,
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> list[AuditLog]:
    """Lecture paginée des logs (ADMIN only)."""
    q = db.query(AuditLog).order_by(AuditLog.created_at.desc())
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    if action:
        q = q.filter(AuditLog.action == action)
    return q.offset(offset).limit(limit).all()