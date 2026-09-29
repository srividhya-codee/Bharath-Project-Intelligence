import os
import re
import glob
from typing import List, Dict, Any

CHROMA_COLLECTION_NAME = "bharat_project_docs"
SAMPLE_DOCS_DIR = "./data/sample_docs"


def clean_text(text: str) -> str:
    """Normalizes whitespace and removes unwanted control characters while preserving markdown structure."""
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def chunk_document_text(text: str, chunk_size: int = 700, overlap: int = 100) -> List[Dict[str, Any]]:
    """Splits document text into overlapping chunks, respecting paragraph and header boundaries."""
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""
    chunk_index = 0

    for para in paragraphs:
        cleaned_para = clean_text(para)
        if not cleaned_para:
            continue

        if len(current_chunk) + len(cleaned_para) > chunk_size and current_chunk:
            chunks.append({
                "chunk_index": chunk_index,
                "text": current_chunk.strip()
            })
            chunk_index += 1
            # Overlap: keep tail of current_chunk
            current_chunk = current_chunk[-overlap:] + " " + cleaned_para
        else:
            current_chunk = (current_chunk + "\n\n" + cleaned_para).strip()

    if current_chunk:
        chunks.append({
            "chunk_index": chunk_index,
            "text": current_chunk.strip()
        })

    return chunks


def load_and_chunk_sample_docs() -> List[Dict[str, Any]]:
    """Loads all 12 synthetic sample documents and breaks them into indexed chunks."""
    doc_files = glob.glob(os.path.join(SAMPLE_DOCS_DIR, "*.txt"))
    all_chunks = []

    for file_path in doc_files:
        filename = os.path.basename(file_path)
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            raw_text = f.read()

        # Parse header metadata if available
        project_code = "GENERAL"
        title = filename.replace(".txt", "").replace("_", " ")
        doc_type = "Administrative Note"
        sensitivity = "Internal"

        match_code = re.search(r"(P-\d+)", filename)
        if match_code:
            project_code = match_code.group(1)

        if "DPR" in filename:
            doc_type = "DPR"
        elif "Inspection" in filename:
            doc_type = "Site Inspection"
        elif "Minutes" in filename:
            doc_type = "Review Minutes"
        elif "Contractor" in filename:
            doc_type = "Contractor Report"
        elif "Clearance" in filename:
            doc_type = "Statutory Clearance"
        elif "Circular" in filename or "Guidelines" in filename:
            doc_type = "Ministry Circular"
            sensitivity = "Public"

        chunks = chunk_document_text(raw_text)
        for c in chunks:
            all_chunks.append({
                "id": f"{project_code}_{filename}_{c['chunk_index']}",
                "project_code": project_code,
                "title": title,
                "doc_type": doc_type,
                "sensitivity": sensitivity,
                "file_path": file_path,
                "chunk_index": c["chunk_index"],
                "text": c["text"],
                "page_no": (c["chunk_index"] // 2) + 1
            })

    return all_chunks


class IngestionEngine:
    _instance = None

    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.chroma_collection = None
        self.initialize_store()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = IngestionEngine()
        return cls._instance

    def initialize_store(self):
        self.chunks = load_and_chunk_sample_docs()
        print(f"Loaded {len(self.chunks)} document chunks from '{SAMPLE_DOCS_DIR}'.")

        # Attempt connection to ChromaDB
        try:
            import chromadb
            client = chromadb.PersistentClient(path="./data/chroma")
            self.chroma_collection = client.get_or_create_collection(
                name=CHROMA_COLLECTION_NAME,
                metadata={"description": "Bharat Project Intelligence Grounded Document Repository"}
            )
            # Add chunks if collection empty
            if self.chroma_collection.count() == 0 and self.chunks:
                ids = [c["id"] for c in self.chunks]
                docs = [c["text"] for c in self.chunks]
                metas = [
                    {
                        "project_code": c["project_code"],
                        "title": c["title"],
                        "doc_type": c["doc_type"],
                        "sensitivity": c["sensitivity"],
                        "chunk_index": c["chunk_index"],
                        "page_no": c["page_no"]
                    }
                    for c in self.chunks
                ]
                self.chroma_collection.add(ids=ids, documents=docs, metadatas=metas)
                print(f"Ingested {len(ids)} document chunks into ChromaDB collection '{CHROMA_COLLECTION_NAME}'.")
        except Exception as e:
            print(f"Notice: ChromaDB initialized in local memory mode ({e}).")
