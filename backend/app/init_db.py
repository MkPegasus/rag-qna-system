from app.database import engine, Base
from app.models import db_models  # noqa: F401 — importer pour enregistrer les modèles
from app.core.security import hash_password
from app.database import SessionLocal
from app.models.db_models import User, RoleEnum

def init_db():
    # Créer toutes les tables
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées avec succès !")

    # Créer un admin par défaut
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@rag.com").first()
        if not existing:
            admin = User(
                nom="Admin",
                prenom="System",
                email="admin@rag.com",
                hashed_password=hash_password("admin123"),
                role=RoleEnum.ADMIN
            )
            db.add(admin)
            db.commit()
            print("✅ Compte admin créé : admin@rag.com / admin123")
        else:
            print("ℹ️ Admin déjà existant")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()