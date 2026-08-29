"""
routers/users.py
CRUD utilisateurs — réservé ADMIN uniquement.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_authenticated_user
from app.models.db_models import User, RoleEnum
from app.models.schemas import UserResponse, UserUpdate, UserRegister
from app.services import auth_service
from app.services.audit_service import log_action, AuditAction

router = APIRouter(prefix="/api/users", tags=["Users (Admin)"])


def require_admin(current_user: User = Depends(get_authenticated_user)) -> User:
    """Dépendance : lève 403 si l'utilisateur n'est pas ADMIN."""
    if RoleEnum(current_user.role) != RoleEnum.ADMIN:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs.")
    return current_user


@router.get("/", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Liste tous les utilisateurs."""
    users = auth_service.get_all_users(db)
    log_action(db, AuditAction.USER_LIST, user_id=str(current_user.id))
    return users


@router.post("/", response_model=UserResponse, status_code=201)
def create_user(
    data: UserRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Crée un utilisateur avec n'importe quel rôle (réservé ADMIN).
    Contrairement au /register public, le rôle fourni est respecté.
    """
    # On réutilise register_user mais on surcharge le rôle après
    user = auth_service.register_user(data, db)
    # Mise à jour du rôle si différent de EMPLOYEE
    if data.role and data.role != RoleEnum.EMPLOYEE:
        user = auth_service.update_user(user.id, {"role": data.role}, db)

    log_action(db, AuditAction.USER_CREATE, user_id=str(current_user.id),
               detail={"created_user": user.email, "role": user.role.value})
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Mise à jour partielle d'un utilisateur (nom, prénom, rôle).
    Seuls les champs envoyés sont modifiés.
    """
    updated = auth_service.update_user(user_id, data.model_dump(exclude_unset=True), db)
    log_action(db, AuditAction.USER_UPDATE, user_id=str(current_user.id),
               detail={"target_user_id": user_id, "changes": data.model_dump(exclude_unset=True)})
    return updated


@router.delete("/{user_id}", status_code=200)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Supprime définitivement un utilisateur."""
    # Empêche l'admin de se supprimer lui-même
    if user_id == current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous supprimer vous-même.")

    result = auth_service.delete_user(user_id, db)
    log_action(db, AuditAction.USER_DELETE, user_id=str(current_user.id),
               detail={"deleted_user_id": user_id})
    return result


@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Consulte les logs d'audit (ADMIN uniquement)."""
    from app.services.audit_service import get_audit_logs
    logs = get_audit_logs(db, limit=200)
    return logs