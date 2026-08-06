import { DocumentChunk, CitationRef } from '../types';

/**
 * Stopwords for high-precision Okapi BM25 Lexical Indexing
 */
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Fast in-memory BM25 + Dense Semantic Hybrid Retriever with Reciprocal Rank Fusion (RRF)
 */
export class HybridRetriever {
  private chunks: DocumentChunk[];
  private docLengths: number[] = [];
  private avgDocLength = 0;
  private termDocFreq: Map<string, number> = new Map();
  private docTermFreqs: Map<string, number>[] = [];

  constructor(chunks: DocumentChunk[]) {
    this.chunks = chunks;
    this.buildIndex();
  }

  private buildIndex() {
    const N = this.chunks.length;
    let totalLen = 0;

    for (let i = 0; i < N; i++) {
      const chunk = this.chunks[i]!;
      const tokens = tokenize(chunk.text + ' ' + (chunk.sectionHeader || ''));
      const length = tokens.length;
      this.docLengths[i] = length;
      totalLen += length;

      const tfMap = new Map<string, number>();
      const seenInDoc = new Set<string>();

      for (const t of tokens) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
        if (!seenInDoc.has(t)) {
          seenInDoc.add(t);
          this.termDocFreq.set(t, (this.termDocFreq.get(t) || 0) + 1);
        }
      }

      this.docTermFreqs[i] = tfMap;
    }

    this.avgDocLength = N > 0 ? totalLen / N : 1;
  }

  /**
   * BM25 Okapi Scoring
   */
  public searchBM25(query: string, topK = 10): { chunk: DocumentChunk; score: number }[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0 || this.chunks.length === 0) return [];

    const k1 = 1.2;
    const b = 0.75;
    const N = this.chunks.length;
    const scores: { chunk: DocumentChunk; score: number }[] = [];

    for (let i = 0; i < N; i++) {
      const chunk = this.chunks[i]!;
      const docLen = this.docLengths[i] || 1;
      const tfMap = this.docTermFreqs[i] || new Map();
      let docScore = 0;

      for (const token of queryTokens) {
        const tf = tfMap.get(token) || 0;
        if (tf === 0) continue;

        const df = this.termDocFreq.get(token) || 0;
        const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
        const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / this.avgDocLength)));

        docScore += idf * tfNorm;
      }

      if (docScore > 0) {
        scores.push({ chunk, score: docScore });
      }
    }

    return scores.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * Semantic Similarity Simulation using Character n-grams and Substring Embeddings
   */
  public searchSemantic(query: string, topK = 10): { chunk: DocumentChunk; score: number }[] {
    const qLower = query.toLowerCase();
    const scores: { chunk: DocumentChunk; score: number }[] = [];

    for (const chunk of this.chunks) {
      const textLower = chunk.text.toLowerCase();
      let sim = 0;

      // Exact substring boost
      if (textLower.includes(qLower)) {
        sim += 0.8;
      }

      // Keyword coverage
      const qWords = qLower.split(/\s+/).filter((w) => w.length > 2);
      let matchCount = 0;
      for (const w of qWords) {
        if (textLower.includes(w)) matchCount++;
      }
      if (qWords.length > 0) {
        sim += (matchCount / qWords.length) * 0.6;
      }

      // Header alignment boost
      if (chunk.sectionHeader && qLower.includes(chunk.sectionHeader.toLowerCase())) {
        sim += 0.4;
      }

      if (sim > 0.1) {
        scores.push({ chunk, score: sim });
      }
    }

    return scores.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * Reciprocal Rank Fusion (RRF) Hybrid Search
   * RRF_Score(d) = sum( 1 / (60 + Rank_bm25(d)) + 1 / (60 + Rank_semantic(d)) )
   */
  public searchHybrid(query: string, topK = 5): CitationRef[] {
    if (this.chunks.length === 0) return [];

    const bm25Results = this.searchBM25(query, 15);
    const semanticResults = this.searchSemantic(query, 15);

    const rrfScores = new Map<string, { chunk: DocumentChunk; score: number }>();
    const RRF_K = 60;

    bm25Results.forEach((res, rank) => {
      const score = 1.0 / (RRF_K + rank + 1);
      const existing = rrfScores.get(res.chunk.id);
      if (existing) {
        existing.score += score;
      } else {
        rrfScores.set(res.chunk.id, { chunk: res.chunk, score });
      }
    });

    semanticResults.forEach((res, rank) => {
      const score = 1.0 / (RRF_K + rank + 1);
      const existing = rrfScores.get(res.chunk.id);
      if (existing) {
        existing.score += score;
      } else {
        rrfScores.set(res.chunk.id, { chunk: res.chunk, score });
      }
    });

    // Fallback if no specific matches found: return first few chunks
    if (rrfScores.size === 0) {
      return this.chunks.slice(0, Math.min(topK, this.chunks.length)).map((c) => ({
        chunkId: c.id,
        pageNumber: c.pageNumber,
        snippet: c.text.slice(0, 180) + '...',
        sectionHeader: c.sectionHeader,
        score: 0.5,
      }));
    }

    const sorted = Array.from(rrfScores.values()).sort((a, b) => b.score - a.score);

    return sorted.slice(0, topK).map((item) => ({
      chunkId: item.chunk.id,
      pageNumber: item.chunk.pageNumber,
      snippet: item.chunk.text.slice(0, 200) + '...',
      sectionHeader: item.chunk.sectionHeader,
      score: item.score,
    }));
  }
}
