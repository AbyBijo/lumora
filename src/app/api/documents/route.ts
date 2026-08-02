import { apiHandler } from '@/lib/server/api';
import { prisma } from '@/lib/db';
import { parseDocument, ParseError } from '@/engine/parse';
import { AppError } from '@/lib/server/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/documents
 *  - multipart form-data: { file, title? } → PDF / DOCX / TXT / MD upload
 *  - JSON: { url } → web URL ingestion, or { title?, content } → paste mode
 * Returns { document: { id, title, fileType, wordCount, chunks, outline } }.
 */
export const POST = apiHandler({
  auth: true,
  handler: async ({ req, user }) => {
    const contentType = req.headers.get('content-type') ?? '';

    let title: string | undefined;
    let fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'url';
    let buffer: Buffer | undefined;
    let url: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');
      if (!(file instanceof File)) {
        throw AppError.validation('No file provided.');
      }
      const name = file.name.toLowerCase();
      if (name.endsWith('.pdf')) fileType = 'pdf';
      else if (name.endsWith('.docx')) fileType = 'docx';
      else if (name.endsWith('.md')) fileType = 'md';
      else if (name.endsWith('.txt')) fileType = 'txt';
      else {
        throw AppError.validation('Unsupported format. Upload a PDF, DOCX, TXT, or Markdown file.');
      }
      buffer = Buffer.from(await file.arrayBuffer());
      title = (form.get('title') as string | null) || undefined;
    } else {
      const body = await req.json().catch(() => ({}));
      if (body.url) {
        url = String(body.url);
        fileType = 'url';
      } else if (body.content) {
        buffer = Buffer.from(String(body.content), 'utf8');
        fileType = 'md';
        title = body.title || 'Pasted notes';
      } else {
        throw AppError.validation('Send a file, a URL, or pasted content.');
      }
    }

    let parsed;
    try {
      parsed = await parseDocument({ fileType, buffer, url, title });
    } catch (e) {
      if (e instanceof ParseError) throw AppError.unprocessable(e.message);
      throw e;
    }

    const doc = await prisma.document.create({
      data: {
        userId: user!.id,
        title: parsed.title,
        fileType: parsed.fileType,
        status: 'ready',
        sourceUrl: url ?? null,
        structure: JSON.stringify(parsed.blocks),
        chunks: {
          create: parsed.chunks.map((c) => ({
            index: c.index,
            text: c.text,
            section: c.section,
            page: c.page,
            startChar: c.startChar,
            endChar: c.endChar,
          })),
        },
      },
    });

    return {
      document: {
        id: doc.id,
        title: doc.title,
        fileType: doc.fileType,
        wordCount: parsed.wordCount,
        chunks: parsed.chunks.length,
        outline: parsed.outline.slice(0, 12),
      },
    };
  },
});
