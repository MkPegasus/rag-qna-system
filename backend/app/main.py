"""
main.py
-------
Point d'entrée de l'application FastAPI.
Enregistre tous les routers et configure CORS pour le frontend React.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, document, query, users
from app.init_db import init_db

# ── Initialisation de l'app ──────────────────────────────────────────────────
app = FastAPI(
    title="RAG QA System",
    description="Système de questions-réponses intelligent basé sur LLM — IUC L3 GL 2025/2026",
    version="1.0.0",
)

# ── CORS (autorise le frontend React en dev) ─────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],  # ports Vite + CRA
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Création des tables au démarrage ─────────────────────────────────────────
@app.on_event("startup")
def startup():
    """Crée les tables MySQL et l'admin par défaut si inexistants."""
    init_db()
    print("✅ Base de données initialisée")

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(document.router)
app.include_router(query.router)
app.include_router(users.router)

# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "message": "RAG QA API opérationnelle",
        "docs": "/docs"
    }