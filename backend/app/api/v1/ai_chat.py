import json
import asyncio
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db.models import User, ChatSession, ChatMessage
from backend.app.api.v1.auth import get_current_user
from backend.app.ai.graph import run_project_intelligence_graph
from backend.app.services.audit_service import log_audit_event

router = APIRouter(prefix="/ai-chat", tags=["AI Intelligence Assistant"])


class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    project_code: Optional[str] = None


@router.post("/query")
def query_ai_assistant(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Synchronous JSON response for AI Assistant queries."""
    user_scope = {
        "ministry_id": current_user.ministry_id,
        "state_id": current_user.state_id,
        "role": current_user.role
    }
    result = run_project_intelligence_graph(
        query=payload.query,
        user_role=current_user.role,
        user_scope=user_scope
    )

    # Persist session and messages
    session_id = payload.session_id or f"sess_{int(datetime.datetime.utcnow().timestamp())}"
    chat_sess = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not chat_sess:
        chat_sess = ChatSession(
            session_id=session_id,
            user_id=current_user.id,
            title=payload.query[:60],
            created_at=datetime.datetime.utcnow()
        )
        db.add(chat_sess)
        db.commit()

    # User message
    user_msg = ChatMessage(
        session_id=chat_sess.id,
        role="user",
        content=payload.query,
        created_at=datetime.datetime.utcnow()
    )
    # Assistant message
    assistant_msg = ChatMessage(
        session_id=chat_sess.id,
        role="assistant",
        content=result["final_answer"],
        citations=result.get("citations"),
        graph_trace=result.get("graph_trace"),
        created_at=datetime.datetime.utcnow()
    )
    db.add_all([user_msg, assistant_msg])
    db.commit()

    log_audit_event(
        db=db,
        action="AI_QUERY_EXECUTED",
        user_id=current_user.id,
        entity_type="ChatSession",
        entity_id=session_id,
        after={"query": payload.query, "citations_count": len(result.get("citations", []))}
    )

    return {
        "session_id": session_id,
        "answer": result["final_answer"],
        "citations": result.get("citations", []),
        "graph_trace": result.get("graph_trace", []),
        "disclaimers": result.get("disclaimers", [])
    }


@router.post("/stream")
async def stream_ai_assistant(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Server-Sent Events (SSE) streaming endpoint for AI assistant responses."""
    user_scope = {
        "ministry_id": current_user.ministry_id,
        "state_id": current_user.state_id,
        "role": current_user.role
    }

    async def event_generator():
        # Execute graph
        result = run_project_intelligence_graph(
            query=payload.query,
            user_role=current_user.role,
            user_scope=user_scope
        )

        # 1. Stream traces node by node
        for trace_item in result.get("graph_trace", []):
            await asyncio.sleep(0.04)
            yield f"event: trace\ndata: {json.dumps(trace_item)}\n\n"

        # 2. Stream citations
        for cit in result.get("citations", []):
            await asyncio.sleep(0.02)
            yield f"event: citation\ndata: {json.dumps(cit)}\n\n"

        # 3. Stream markdown answer in progressive chunks
        full_text = result["final_answer"]
        chunk_size = 12
        for i in range(0, len(full_text), chunk_size):
            token = full_text[i:i + chunk_size]
            yield f"event: token\ndata: {json.dumps({'token': token})}\n\n"
            await asyncio.sleep(0.015)

        # 4. Stream completion event
        yield f"event: done\ndata: {json.dumps({'disclaimers': result.get('disclaimers', [])})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )
