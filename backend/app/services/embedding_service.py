import os
from typing import Optional
from openai import OpenAI

_client: Optional[OpenAI] = None

def _get_client() -> Optional[OpenAI]:
    global _client
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        return None
    if not _client:
        _client = OpenAI(api_key=api_key)
    return _client


def generate_embedding(text: str) -> Optional[list]:
    client = _get_client()
    if not client:
        return None
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"[Embedding] Error: {e}")
        return None


def generate_and_store(issue_id: int, title: str, description: str, db):
    from app.models.models import Issue
    embedding = generate_embedding(f"{title} {description}")
    if embedding is not None:
        issue = db.query(Issue).filter(Issue.id == issue_id).first()
        if issue:
            try:
                issue.embedding = embedding
                db.commit()
            except Exception:
                db.rollback()
