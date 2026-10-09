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
    fait le chunking + embedding + stockage pgvector + Postgres.
    """
    import uuid
    from pathlib import Path
    from llama_index.core import SimpleDirectoryReader
    from llama_index.core.node_parser import SentenceSplitter
    from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
    from app.models.db_models import Document, DocumentChunk
    from app.config import settings

    doc_id = str(uuid.uuid4())

    # Chunking
    documents = SimpleDirectoryReader(input_files=[file_path]).load_data()
    splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
    nodes = splitter.get_nodes_from_documents(documents)

    embed_model = GoogleGenAIEmbedding(
        model_name=settings.EMBED_MODEL,
        api_key=settings.GEMINI_API_KEY,
    )

    for node in nodes:
        content = node.get_content()
        embedding = embed_model.get_text_embedding(content)
        db.add(DocumentChunk(
            doc_id=doc_id,
            text=content,
            access_level=access_level,
            department=department or "general",
            filename=filename,
            page_label=node.metadata.get("page_label"),
            embedding=embedding,
        ))

    # Postgres (métadonnées document)
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
        "chunks_indexed": len(nodes),
        "message": "Document indexé avec succès",
    }


def delete_document_from_index(doc_id: str, db: Session) -> None:
    from pathlib import Path
    from app.models.db_models import Document, DocumentChunk

    db.query(DocumentChunk).filter(DocumentChunk.doc_id == doc_id).delete()

    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document introuvable")

    try:
        Path(str(doc.chemin_fichier)).unlink(missing_ok=True)
    except Exception as e:
        print(f"[INGESTION] Fichier non supprimé : {e}")

    db.delete(doc)
    db.commit()