from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.db_models import User, RoleEnum
from app.models.schemas import UserRegister, UserLogin, Token, UserResponse
from app.core.security import hash_password, verify_password, create_access_token
import uuid

def register_user(data: UserRegister, db: Session) -> UserResponse:
    """
    Inscription publique : le rôle est TOUJOURS forcé à EMPLOYEE.
    Seul un ADMIN peut promouvoir un utilisateur via /api/users/{id}.
    """
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Cet email est déjà utilisé"
        )

    user = User(
        id=str(uuid.uuid4()),
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=RoleEnum.EMPLOYEE   # ← forcé, on ignore data.role pour la sécurité
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.from_orm(user)


def login_user(data: UserLogin, db: Session) -> Token:
    """
    Connexion : vérifie les identifiants et retourne un JWT.
    Le 'sub' doit être une string (standard JWT).
    """
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, str(user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )

    token = create_access_token(data={
        "sub": str(user.id),    # ← str() obligatoire pour decode_access_token
        "email": user.email,
        "role": user.role.value
    })

    return Token(access_token=token)


def get_user_by_id(user_id: str, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user


def get_all_users(db: Session) -> list:
    return db.query(User).all()


def update_user(user_id: str, data: dict, db: Session) -> User:
    """
    Mise à jour partielle (PATCH) : seuls les champs non-None sont modifiés.
    Utilisé par le router /api/users/{id} (ADMIN only).
    """
    user = get_user_by_id(user_id, db)
    for key, value in data.items():
        if value is not None:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(user_id: str, db: Session):
    user = get_user_by_id(user_id, db)
    db.delete(user)
    db.commit()
    return {"message": "Utilisateur supprimé avec succès"}