import os
import hashlib
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.db.models import Document, DocumentChunk, Project, User
from backend.app.api.v1.auth import get_current_user, require_roles
from backend.app.services.audit_service import log_audit_event

router = APIRouter(prefix="/documents", tags=["Document Management & Ingestion"])

UPLOAD_DIR = "./data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("")
def list_documents(
    project_code: Optional[str] = None,
    doc_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Document).join(Document.project)
    if project_code:
        query = query.filter(Project.project_code == project_code)
    if doc_type:
        query = query.filter(Document.doc_type == doc_type)

    # Document sensitivity filter based on role
    if current_user.role not in ["Super Admin", "Senior Decision Maker"]:
        query = query.filter(Document.sensitivity_level.in_(["Public", "Internal"]))

    docs = query.all()
    return [
        {
            "id": d.id,
            "project_id": d.project_id,
            "project_code": d.project.project_code,
            "doc_type": d.doc_type,
            "title": d.title,
            "file_path": d.file_path,
            "sensitivity_level": d.sensitivity_level,
            "uploaded_by": d.uploaded_by,
            "uploaded_at": d.uploaded_at.isoformat(),
            "ingestion_status": d.ingestion_status
        }
        for d in docs
    ]


@router.post("/upload")
async def upload_document(
    project_code: str = Form(...),
    doc_type: str = Form(...),
    title: str = Form(...),
    sensitivity_level: str = Form("Internal"),
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["Super Admin", "Project Authority"])),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.project_code == project_code).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    content = await file.read()
    checksum = hashlib.sha256(content).hexdigest()
    filename = f"{project_code}_{int(datetime.datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(content)

    doc = Document(
        project_id=project.id,
        doc_type=doc_type,
        title=title,
        file_path=file_path,
        sensitivity_level=sensitivity_level,
        uploaded_by=current_user.name,
        uploaded_at=datetime.datetime.utcnow(),
        ingestion_status="Indexed",
        checksum=checksum
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Extract text and chunk if plain text
    try:
        text_content = content.decode("utf-8", errors="ignore")
        if text_content:
            chunk = DocumentChunk(
                document_id=doc.id,
                chunk_index=0,
                page_no=1,
                text=text_content[:1500],
                embedding_id=f"emb_upload_{doc.id}"
            )
            db.add(chunk)
            db.commit()
    except Exception:
        pass

    log_audit_event(
        db=db,
        action="DOCUMENT_UPLOADED",
        user_id=current_user.id,
        entity_type="Document",
        entity_id=str(doc.id),
        after={"project_code": project_code, "title": title, "doc_type": doc_type}
    )

    return {"message": "Document uploaded and indexed successfully", "document_id": doc.id}


@router.get("/{document_id}")
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Sensitivity check
    if doc.sensitivity_level in ["Confidential", "Restricted"]:
        if current_user.role not in ["Super Admin", "Senior Decision Maker"]:
            raise HTTPException(status_code=403, detail="Access denied: Insufficient sensitivity clearance")

    # Read content preview if text exists
    preview = ""
    if os.path.exists(doc.file_path):
        try:
            with open(doc.file_path, "r", encoding="utf-8", errors="ignore") as f:
                preview = f.read(3000)
        except Exception:
            preview = "[Binary or encrypted document file]"

    log_audit_event(
        db=db,
        action="DOCUMENT_VIEWED",
        user_id=current_user.id,
        entity_type="Document",
        entity_id=str(doc.id)
    )

    return {
        "id": doc.id,
        "title": doc.title,
        "doc_type": doc.doc_type,
        "file_path": doc.file_path,
        "sensitivity_level": doc.sensitivity_level,
        "uploaded_at": doc.uploaded_at.isoformat(),
        "preview": preview
    }
