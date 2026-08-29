import time
import uuid
import json
from sqlalchemy.orm import Session
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.core import Settings
from groq import Groq
from fastapi import HTTPException
from typing import Optional
from app.config import settings
from app.models.db_models import Conversation, Message, RoleEnum
from app.models.schemas import QueryResponse, SourceNode
from app.services.audit_service import log_action
import chromadb

# Mapping rôle → niveaux d'accès autorisés
ROLE_ACCESS_MAP = {
    RoleEnum.EMPLOYEE: ["PUBLIC"],
    RoleEnum.MANAGER: ["PUBLIC", "INTERNAL"],
    RoleEnum.DOCUMENT_MANAGER: ["PUBLIC", "INTERNAL", "CONFIDENTIAL"],
    RoleEnum.ADMIN: ["PUBLIC", "INTERNAL", "CONFIDENTIAL", "SECRET"],
}

def _configure_embeddings():
    Settings.embed_model = OllamaEmbedding(
        model_name=settings.EMBED_MODEL,
        base_url=settings.OLLAMA_BASE_URL
    )

def _get_allowed_access_levels(role: RoleEnum) -> list:
    return ROLE_ACCESS_MAP.get(role, ["PUBLIC"])

def _retrieve_chunks(question: str, role: RoleEnum) -> list:
    _configure_embeddings()

    allowed_levels = _get_allowed_access_levels(role)

    chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PATH)
    collection = chroma_client.get_or_create_collection("rag_documents")

    # Générer l'embedding de la question directement via Ollama
    embed_model = OllamaEmbedding(
        model_name=settings.EMBED_MODEL,
        base_url=settings.OLLAMA_BASE_URL
    )
    query_embedding = embed_model.get_query_embedding(question)

    # Interroger ChromaDB directement sans passer par LlamaIndex
    try:
        if len(allowed_levels) == 1:
            where_filter = {"access_level": {"$eq": allowed_levels[0]}}
        else:
            where_filter = {"access_level": {"$in": allowed_levels}}

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=settings.TOP_K,
            where=where_filter,
            include=["documents", "metadatas", "distances"],
        )
    except Exception as e:
        print(f"[RAG] Erreur ChromaDB query : {e}")
        return []

    # Convertir les résultats en objets compatibles avec le reste du code
    class SimpleNode:
        def __init__(self, text, metadata, score):
            self.text = text
            self.metadata = metadata
            self.score = score

    nodes = []
    if results["documents"] and results["documents"][0]:
        for text, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            nodes.append(SimpleNode(
                text=text,
                metadata=meta,
                score=round(1 - dist, 4),
            ))

    return nodes

def _generate_with_groq(question: str, context: str) -> str:
    """
    Génère une réponse avec Groq en utilisant le contexte récupéré
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    prompt = f"""Tu es un assistant documentaire intelligent pour une entreprise.
Réponds à la question de l'utilisateur en te basant UNIQUEMENT sur le contexte fourni.
Si la réponse n'est pas dans le contexte, dis-le clairement.
Réponds en français.

Contexte :
{context}

Question : {question}

Réponse :"""

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=1024
    )

    return response.choices[0].message.content or "Désolé, je n'ai pas pu générer une réponse pour le moment."

def query_documents(
    question: str,
    user_id: str,
    user_role: RoleEnum,
    conversation_id: Optional[str] = None,  
    db: Optional[Session] = None
) -> QueryResponse:

    start_time = time.time()

    # 1. Retrieval sécurisé
    nodes = _retrieve_chunks(question, user_role)

    if not nodes:
        answer = "Aucun document pertinent trouvé pour répondre à votre question. Vérifiez que des documents ont été indexés et que vous avez les droits d'accès nécessaires."
        sources = []
    else:
        # 2. Construire le contexte
        context = "\n\n".join([
            f"[Source: {node.metadata.get('file_name', 'inconnu')}]\n{node.text}"
            for node in nodes
        ])

        # 3. Générer avec Groq
        answer = _generate_with_groq(question, context)

        # 4. Extraire les sources
        sources = [
            SourceNode(
                filename=node.metadata.get("file_name", "inconnu"),
                page=node.metadata.get("page_label", None),
                score=round(node.score, 3) if node.score else None,
                text_preview=node.text[:200] + "..." if len(node.text) > 200 else node.text
            )
            for node in nodes
        ]

    response_time = int((time.time() - start_time) * 1000)

    # 5. Sauvegarder dans MySQL
    if db:
        # Créer ou récupérer la conversation
        if not conversation_id:
            conv = Conversation(
                id=str(uuid.uuid4()),
                user_id=user_id
            )
            db.add(conv)
            db.flush()
            conversation_id = str(conv.id)
        else:
            conv = db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            ).first()
            if not conv:
                conv = Conversation(
                    id=str(uuid.uuid4()),
                    user_id=user_id
                )
                db.add(conv)
                db.flush()
                conversation_id = str(conv.id)

        # Message utilisateur
        user_msg = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            contenu=question,
            role="user"
        )
        db.add(user_msg)

        # Message assistant
        assistant_msg = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            contenu=answer,
            role="assistant",
            sources_json=json.dumps([s.dict() for s in sources], ensure_ascii=False),
            response_time_ms=response_time
        )
        db.add(assistant_msg)

        # Logger
        log_action(
            db=db,
            action="QUERY",
            detail=f"Question: {question[:100]}",
            user_id=user_id
        )

        db.commit()

    return QueryResponse(
        question=question,
        answer=answer,
        sources=sources,
        response_time_ms=response_time,
        conversation_id=conversation_id or str(uuid.uuid4())
    )

def get_conversations(user_id: str, db: Session) -> list:
    return db.query(Conversation)\
             .filter(Conversation.user_id == user_id)\
             .order_by(Conversation.date_debut.desc())\
             .all()

def get_conversation_messages(
    conversation_id: str,
    user_id: str,
    db: Session
) -> list:
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    ).first()

    if not conv:
        raise ValueError("Conversation non trouvée")

    return db.query(Message)\
             .filter(Message.conversation_id == conversation_id)\
             .order_by(Message.created_at.asc())\
             .all()