import { NextRequest, NextResponse } from 'next/server';
import { HybridRetriever } from '@/shared/lib/search';
import { DocumentChunk } from '@/shared/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, chunks, topK = 5 } = body as {
      query: string;
      chunks: DocumentChunk[];
      topK?: number;
    };

    if (!query || !chunks || !Array.isArray(chunks)) {
      return NextResponse.json({ error: 'Query and chunks array required' }, { status: 400 });
    }

    const retriever = new HybridRetriever(chunks);
    const citations = retriever.searchHybrid(query, topK);

    return NextResponse.json({
      success: true,
      query,
      citations,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Hybrid search failed' }, { status: 500 });
  }
}
