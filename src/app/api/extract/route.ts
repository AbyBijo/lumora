import { NextRequest, NextResponse } from 'next/server';
import { chunkDocumentText } from '@/shared/lib/chunker';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId, text, fileName } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    const docId = documentId || `doc_${Date.now()}`;
    const chunks = chunkDocumentText(docId, text);

    return NextResponse.json({
      success: true,
      documentId: docId,
      fileName: fileName || 'untitled.txt',
      chunkCount: chunks.length,
      chunks,
    });
  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}
