"""
routers/auth.py
Endpoints publics d'authentification.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_authenticated_user
from app.models.schemas import UserRegister, UserLogin, Token, UserResponse
from app.models.db_models import User
from app.services import auth_service
from app.services.audit_service import log_action, AuditAction

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """
    Inscription publique. Le rôle est forcé à EMPLOYEE.
    """
    user = auth_service.register_user(data, db)
    log_action(db, AuditAction.REGISTER, user_id=str(user.id),
               detail={"email": user.email})
    return user


@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    token = auth_service.login_user(data, db)
    if user:
        log_action(db, AuditAction.LOGIN, user_id=str(user.id))
    return token

@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_authenticated_user)):
    """
    Retourne le profil de l'utilisateur connecté.
    Nécessite un token Bearer valide.
    """
    return current_user