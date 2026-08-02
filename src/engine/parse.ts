import type { ParsedDocument } from '@/types';
import { chunkDocument } from './chunker';
// Native/CJS parsing libraries — externalized in next.config.mjs so they load
// from node_modules at runtime (their internals don't survive bundling).
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

/**
 * Ingestion: raw bytes / URLs → normalized ParsedDocument.
 * Every path funnels into the same chunker, so citations behave identically
 * regardless of source format.
 */

const MAX_BYTES = 15 * 1024 * 1024;

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

function titleFromText(text: string, fallback: string, titleHint?: string): string {
  const lines = text.split('\n').map((l) => l.trim());
  // 1) Explicit markdown headings.
  const heading = lines.find((l) => /^#{1,2}\s/.test(l) && l.length <= 90);
  if (heading) return heading.replace(/^#{1,2}\s*/, '').replace(/[.:\s]+$/, '');
  // 2) PDF title hint (largest-font line on page 1).
  if (titleHint) return titleHint;
  // 3) First short standalone line.
  const firstLine = lines.find((l) => l.length > 3 && l.length <= 90 && !/^#{1,6}\s/.test(l));
  if (firstLine) return firstLine.replace(/[.:\s]+$/, '');
  // 4) First sentence, truncated.
  const firstSentence = text.replace(/\s+/g, ' ').match(/^.{10,80}?[.!?]/);
  if (firstSentence) return firstSentence[0].slice(0, 80).replace(/[.:\s]+$/, '') + '.';
  return fallback;
}

// ── PDF ──────────────────────────────────────────────────────────────────────

interface PdfItem {
  str?: string;
  hasEOL?: boolean;
  transform?: number[];
}

/**
 * Rebuild line structure from pdf.js items by grouping items with a similar
 * baseline y-position, then ordering by font size. This turns flat PDF text
 * into something the chunker can see headings in, and lets us infer the title
 * (the largest-font line on page 1).
 */
function pdfPageToLines(items: PdfItem[]): { text: string; titleHint?: string } {
  const lines: { y: number; parts: { str: string; h: number }[] }[] = [];
  for (const it of items) {
    if (!it.str) continue;
    const y = it.transform?.[5] ?? 0;
    const h = Math.abs(it.transform?.[3] ?? 10);
    const last = lines[lines.length - 1];
    if (last && Math.abs(last.y - y) < 4) last.parts.push({ str: it.str, h });
    else lines.push({ y, parts: [{ str: it.str, h }] });
  }

  let titleHint: string | undefined;
  if (lines.length > 0) {
    const maxH = Math.max(...lines.map((l) => Math.max(...l.parts.map((p) => p.h))));
    const titleLine = lines.find((l) => l.parts.some((p) => p.h === maxH && maxH >= 14));
    const title = titleLine?.parts.map((p) => p.str).join(' ').trim();
    if (title && title.length >= 4 && title.length <= 90) titleHint = title.replace(/[.:\s]+$/, '');
  }

  const text = lines
    .map((l) => l.parts.map((p) => p.str).join(' ').trim())
    .filter(Boolean)
    .join('\n');
  return { text, titleHint };
}

async function parsePdf(buffer: Buffer): Promise<{ text: string; pages: string[]; titleHint?: string }> {
  // Try pdfjs-dist (per-page) first for precise page citations.
  try {
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages: string[] = [];
    let titleHint: string | undefined;
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      const { text, titleHint: hint } = pdfPageToLines(tc.items as PdfItem[]);
      pages.push(text);
      if (i === 1 && hint) titleHint = hint;
    }
    await doc.destroy().catch(() => undefined);
    const text = pages.join('\n\n');
    if (text.trim().length > 40) return { text, pages, titleHint };
  } catch {
    // fall through to pdf-parse
  }
  // Fallback: pdf-parse (text-only).
  const data = await pdfParse(buffer);
  const text = String(data.text ?? '');
  return { text, pages: [], titleHint: undefined };
}

// ── DOCX ─────────────────────────────────────────────────────────────────────

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return String(result.value ?? '');
}

// ── HTML / URL ───────────────────────────────────────────────────────────────

function htmlToMarkdownish(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() || 'Web article';

  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');

  // Preserve heading structure for the chunker.
  s = s.replace(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _tag, inner) => `\n## ${stripTags(inner)}\n`);
  // Paragraphs & list items become lines.
  s = s.replace(/<\/(p|li|div|blockquote|tr|h[1-6])[^>]*>/gi, '\n');
  s = stripTags(s);
  s = s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  return { title, text: s };
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}

// ── Public entry ─────────────────────────────────────────────────────────────

export interface ParseInput {
  fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'url';
  buffer?: Buffer;
  url?: string;
  title?: string;
}

export async function parseDocument(input: ParseInput): Promise<ParsedDocument> {
  if (input.fileType === 'url') {
    if (!input.url) throw new ParseError('Missing URL.');
    const res = await fetch(input.url, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; LumoraBot/0.1)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new ParseError(`Could not fetch URL (HTTP ${res.status}).`);
    const html = await res.text();
    const { title, text } = htmlToMarkdownish(html);
    const { chunks, outline, blocks } = chunkDocument(text, {});
    return {
      title: input.title || title,
      fileType: 'url',
      sourceUrl: input.url,
      chunks,
      blocks,
      outline,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    };
  }

  if (!input.buffer) throw new ParseError('Missing file contents.');
  if (input.buffer.length > MAX_BYTES) {
    throw new ParseError('File is larger than 15 MB. Try a smaller document.');
  }

  let text = '';
  let pages: string[] = [];
  let titleHint: string | undefined;

  try {
    switch (input.fileType) {
      case 'pdf': {
        const r = await parsePdf(input.buffer);
        text = r.text;
        pages = r.pages;
        titleHint = r.titleHint;
        break;
      }
      case 'docx':
        text = await parseDocx(input.buffer);
        break;
      case 'md':
      case 'txt':
        text = input.buffer.toString('utf8');
        break;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    throw new ParseError(`Could not read ${input.fileType.toUpperCase()} file: ${msg}`);
  }

  if (!text || text.trim().length < 30) {
    throw new ParseError(
      input.fileType === 'pdf'
        ? 'This PDF appears to be image-based (scanned) and contains no extractable text.'
        : 'The file contains no readable text.'
    );
  }

  const { chunks, outline, blocks } = chunkDocument(text, { pages });
  if (chunks.length === 0) throw new ParseError('Could not extract any content from this file.');

  return {
    title: input.title || titleFromText(text, `Document ${new Date().toLocaleDateString()}`, titleHint),
    fileType: input.fileType,
    chunks,
    blocks,
    outline,
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
}
