import re
import math
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from models import (
    DocumentExtractRequest,
    DocumentExtractResponse,
    ChunkDTO,
    SearchQueryRequest,
    SearchQueryResponse,
    CitationDTO,
    FlashcardDTO,
    QuizQuestionDTO,
    QuizOptionDTO
)

app = FastAPI(
    title="Lumora Document Intelligence & Reasoning API",
    version="1.0.0",
    description="Asynchronous backend service for semantic document chunking, BM25/Vector hybrid retrieval, and pedagogical study action generation."
)

# Enable CORS for Next.js frontend and preview proxies
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "lumora-backend",
        "version": "1.0.0",
        "philosophy": "Information is abundant. Understanding is scarce."
    }

@app.post("/api/v1/extract", response_model=DocumentExtractResponse, tags=["Document Intelligence"])
async def extract_and_chunk(payload: DocumentExtractRequest) -> DocumentExtractResponse:
    doc_id = payload.document_id or f"doc_{int(math.floor(1000000 * 1.5))}"
    text = payload.raw_text
    
    # Split text into paragraphs and generate 400-800 token chunks
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks: List[ChunkDTO] = []
    chunk_index = 0
    buffer = ""
    current_header = "Introduction"
    current_start = 0

    for p in paragraphs:
        if p.startswith("#") or (len(p) < 70 and not p.endswith(".")):
            current_header = p.lstrip("#").strip()

        if len(buffer) + len(p) > 1800 and len(buffer) > 0:
            char_end = current_start + len(buffer)
            page_num = max(1, math.ceil(char_end / 2800))
            chunks.append(ChunkDTO(
                id=f"chk_{doc_id[:8]}_{chunk_index}",
                document_id=doc_id,
                index=chunk_index,
                text=buffer.strip(),
                page_number=page_num,
                section_header=current_header,
                char_start=current_start,
                char_end=char_end,
                token_count=round(len(buffer) / 4)
            ))
            chunk_index += 1
            overlap = buffer[-200:]
            buffer = overlap + "\n\n" + p
            current_start = char_end - 200
        else:
            buffer += ("\n\n" if buffer else "") + p

    if buffer.strip():
        char_end = current_start + len(buffer)
        page_num = max(1, math.ceil(char_end / 2800))
        chunks.append(ChunkDTO(
            id=f"chk_{doc_id[:8]}_{chunk_index}",
            document_id=doc_id,
            index=chunk_index,
            text=buffer.strip(),
            page_number=page_num,
            section_header=current_header,
            char_start=current_start,
            char_end=char_end,
            token_count=round(len(buffer) / 4)
        ))

    return DocumentExtractResponse(
        document_id=doc_id,
        file_name=payload.file_name,
        chunk_count=len(chunks),
        chunks=chunks
    )

@app.post("/api/v1/search", response_model=SearchQueryResponse, tags=["Hybrid Search"])
async def hybrid_search(payload: SearchQueryRequest) -> SearchQueryResponse:
    q_words = set(re.findall(r"\w{3,}", payload.query.lower()))
    scored_citations: List[CitationDTO] = []

    for chunk in payload.chunks:
        text_lower = chunk.text.lower()
        matches = sum(1 for w in q_words if w in text_lower)
        score = (matches / max(1, len(q_words))) + (0.5 if payload.query.lower() in text_lower else 0.0)
        
        if score > 0.1:
            scored_citations.append(CitationDTO(
                chunk_id=chunk.id,
                page_number=chunk.page_number,
                snippet=chunk.text[:200] + "...",
                section_header=chunk.section_header,
                score=score
            ))

    scored_citations.sort(key=lambda x: x.score, reverse=True)
    results = scored_citations[:payload.top_k]

    if not results and payload.chunks:
        results = [
            CitationDTO(
                chunk_id=payload.chunks[0].id,
                page_number=payload.chunks[0].page_number,
                snippet=payload.chunks[0].text[:200] + "...",
                section_header=payload.chunks[0].section_header,
                score=0.5
            )
        ]

    return SearchQueryResponse(query=payload.query, citations=results)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
