from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.db_models import AccessLevelEnum, RoleEnum
from app.services.auth_service import get_user_by_id
async def ingest_document(
    file_path: str,
    filename: str,
    department: Optional[str],
    access_level: AccessLevelEnum,
    uploaded_by: str,
    db: Session,
) -> dict:
    """
    Reçoit le fichier déjà sauvegardé sur disque (le router s'en charge),
    fait le chunking + embedding + stockage ChromaDB + MySQL.
    """
    import uuid
    from pathlib import Path
    from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext
    from llama_index.vector_stores.chroma import ChromaVectorStore
    from llama_index.embeddings.ollama import OllamaEmbedding
    import chromadb
    from app.models.db_models import Document
    from app.config import settings

    doc_id = str(uuid.uuid4())

    # Chunking
    documents = SimpleDirectoryReader(input_files=[file_path]).load_data()

    # Métadonnées sur chaque chunk pour le filtrage au retrieval
    for doc in documents:
        doc.metadata.update({
            "doc_id": doc_id,
            "filename": filename,
            "access_level": access_level.value,
            "department": department or "general",
        })

    # ChromaDB
    chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PATH)
    collection = chroma_client.get_or_create_collection("rag_documents")
    vector_store = ChromaVectorStore(chroma_collection=collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    embed_model = OllamaEmbedding(
        model_name="nomic-embed-text",
        base_url=settings.OLLAMA_BASE_URL,
    )

    VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        embed_model=embed_model,
        show_progress=True,
    )

    # MySQL
    taille_ko = round(Path(file_path).stat().st_size / 1024, 2)
    db_doc = Document(
        id=doc_id,
        titre=filename,
        extension=Path(filename).suffix.lower(),
        chemin_fichier=file_path,
        department=department,
        access_level=access_level,
        uploaded_by=uploaded_by,
        taille=taille_ko,
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    return {
        "id": doc_id,
        "titre": filename,
        "extension": Path(filename).suffix.lower(),
        "department": department,
        "access_level": access_level,
        "chunks_indexed": len(documents),
        "message": "Document indexé avec succès",
    }


def delete_document_from_index(doc_id: str, db: Session) -> None:
    from pathlib import Path
    import chromadb
    from app.models.db_models import Document
    from app.config import settings

    # ChromaDB
    try:
        chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PATH)
        collection = chroma_client.get_collection("rag_documents")
        collection.delete(where={"doc_id": doc_id})
    except Exception as e:
        print(f"[INGESTION] ChromaDB delete warning : {e}")

    # MySQL + fichier disque
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document introuvable")

    try:
        Path(str(doc.chemin_fichier)).unlink(missing_ok=True)
    except Exception as e:
        print(f"[INGESTION] Fichier non supprimé : {e}")

    db.delete(doc)
    db.commit()