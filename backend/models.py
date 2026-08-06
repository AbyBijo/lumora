from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID, uuid4

class BoundingBoxDTO(BaseModel):
    x: float
    y: float
    width: float
    height: float
    page_number: int

class ChunkDTO(BaseModel):
    id: str
    document_id: str
    index: int
    text: str
    page_number: int
    section_header: Optional[str] = None
    char_start: int
    char_end: int
    token_count: int
    bounding_boxes: Optional[List[BoundingBoxDTO]] = None

class DocumentExtractRequest(BaseModel):
    document_id: Optional[str] = None
    raw_text: str = Field(..., description="Raw text or parsed content stream")
    file_name: str = "document.txt"

class DocumentExtractResponse(BaseModel):
    document_id: str
    file_name: str
    chunk_count: int
    chunks: List[ChunkDTO]

class SearchQueryRequest(BaseModel):
    query: str
    chunks: List[ChunkDTO]
    top_k: int = 5

class CitationDTO(BaseModel):
    chunk_id: str
    page_number: int
    snippet: str
    section_header: Optional[str] = None
    score: float

class SearchQueryResponse(BaseModel):
    query: str
    citations: List[CitationDTO]

class FlashcardDTO(BaseModel):
    id: str
    front: str
    back: str
    chunk_id: str
    page_number: int
    key_concept: str

class QuizOptionDTO(BaseModel):
    id: str
    text: str
    is_correct: bool
    explanation: str

class QuizQuestionDTO(BaseModel):
    id: str
    question_text: str
    options: List[QuizOptionDTO]
    difficulty: str
    chunk_id: str
    page_number: int
    concept_tested: str
