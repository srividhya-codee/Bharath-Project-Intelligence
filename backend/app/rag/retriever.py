import re
from typing import List, Dict, Any, Optional
from backend.app.rag.ingestion import IngestionEngine


def hybrid_search_documents(
    query: str,
    project_code: Optional[str] = None,
    user_role: str = "Government Officer",
    top_k: int = 4
) -> List[Dict[str, Any]]:
    """
    Performs hybrid retrieval (semantic similarity + keyword matching) over project documents.
    Enforces RBAC sensitivity clearance and project scoping.
    """
    engine = IngestionEngine.get_instance()
    allowed_clearance = ["Public", "Internal"]
    if user_role in ["Super Admin", "Senior Decision Maker"]:
        allowed_clearance.extend(["Confidential", "Restricted"])

    query_tokens = set(re.findall(r"\w+", query.lower()))
    results = []

    # 1. Check ChromaDB collection
    if engine.chroma_collection is not None:
        try:
            where_filter = None
            if project_code:
                where_filter = {"project_code": project_code.upper()}

            chroma_res = engine.chroma_collection.query(
                query_texts=[query],
                n_results=min(top_k * 2, max(1, engine.chroma_collection.count())),
                where=where_filter
            )

            if chroma_res and chroma_res["documents"] and len(chroma_res["documents"][0]) > 0:
                docs = chroma_res["documents"][0]
                metas = chroma_res["metadatas"][0]
                distances = chroma_res["distances"][0] if "distances" in chroma_res and chroma_res["distances"] else [0.2] * len(docs)

                for doc_text, meta, dist in zip(docs, metas, distances):
                    if meta.get("sensitivity") not in allowed_clearance:
                        continue
                    results.append({
                        "project_code": meta.get("project_code"),
                        "title": meta.get("title"),
                        "doc_type": meta.get("doc_type"),
                        "chunk_index": meta.get("chunk_index"),
                        "page_no": meta.get("page_no"),
                        "score": round(1.0 - (dist if dist <= 1.0 else 0.5), 3),
                        "snippet": doc_text
                    })
        except Exception:
            pass

    # 2. Local fallback / Hybrid keyword boost if ChromaDB had few results
    if len(results) < top_k and engine.chunks:
        scored_candidates = []
        for c in engine.chunks:
            if c["sensitivity"] not in allowed_clearance:
                continue
            if project_code and c["project_code"].upper() != project_code.upper():
                continue

            chunk_tokens = set(re.findall(r"\w+", c["text"].lower()))
            overlap = len(query_tokens.intersection(chunk_tokens))
            if overlap > 0:
                score = round(overlap / max(1, len(query_tokens)), 3)
                scored_candidates.append({
                    "project_code": c["project_code"],
                    "title": c["title"],
                    "doc_type": c["doc_type"],
                    "chunk_index": c["chunk_index"],
                    "page_no": c["page_no"],
                    "score": score,
                    "snippet": c["text"]
                })

        scored_candidates = sorted(scored_candidates, key=lambda x: x["score"], reverse=True)
        # Merge without duplicates
        existing_keys = {(r["title"], r["chunk_index"]) for r in results}
        for cand in scored_candidates:
            key = (cand["title"], cand["chunk_index"])
            if key not in existing_keys:
                results.append(cand)
                existing_keys.add(key)
            if len(results) >= top_k:
                break

    return results[:top_k]
