import type { ParsedBlock, ParsedChunk } from '@/types';
import { isHeadingLine, stripMarkdownHeading, headingLevel } from './text';

const TARGET_CHUNK = 900; // target chars per chunk
const MAX_CHUNK = 1500;

export interface HeadingBlock {
  level: number;
  title: string;
  lineIndex: number;
}

/** Find the heading outline of a document and split body text into logical blocks. */
export function buildBlocks(lines: string[]): { blocks: { heading?: HeadingBlock; text: string }[]; outline: string[] } {
  const headings: HeadingBlock[] = [];
  const blocks: { heading?: HeadingBlock; text: string }[] = [];
  let current: { heading?: HeadingBlock; text: string[] } = { text: [] };

  const flush = () => {
    const body = current.text.join('\n').trim();
    if (body || current.heading) {
      blocks.push({ heading: current.heading, text: body });
    }
    current = { text: [] };
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (isHeadingLine(line, i, lines)) {
      flush();
      const title = stripMarkdownHeading(line);
      headings.push({ level: headingLevel(line), title, lineIndex: i });
      current.heading = { level: headingLevel(line), title, lineIndex: i };
    } else if (line.trim()) {
      current.text.push(line);
    }
  });
  flush();

  const outline = headings.map((h) => `${h.title}${h.level > 1 ? ` (${'§'.repeat(h.level)})` : ''}`);
  return { blocks, outline };
}

function chunkBody(text: string, _startCharBase: number): string[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/)
    .map((s) => s.trim())
    .filter(Boolean);

  const out: string[] = [];
  let buf = '';
  for (const s of sentences) {
    if (buf && (buf + ' ' + s).length > TARGET_CHUNK) {
      out.push(buf.trim());
      buf = s;
    } else {
      buf = buf ? buf + ' ' + s : s;
    }
    if (buf.length > MAX_CHUNK) {
      out.push(buf.trim());
      buf = '';
    }
  }
  if (buf.trim()) out.push(buf.trim());
  if (out.length === 0 && text.trim()) out.push(text.trim());
  return out;
}

/**
 * Convert raw extracted text into source chunks, each carrying its section
 * (nearest heading) and page (when known), so every citation is resolvable.
 * Also returns the structural blocks (headings + bodies) so curriculum
 * assembly can honor the document's own outline.
 */
export function chunkDocument(
  rawText: string,
  opts: { pages?: string[] } = {}
): { chunks: ParsedChunk[]; outline: string[]; blocks: ParsedBlock[] } {
  const lines = rawText.replace(/\r\n/g, '\n').replace(/\f/g, '\n\n').split('\n');
  const { blocks, outline } = buildBlocks(lines);

  const chunks: ParsedChunk[] = [];
  let charOffset = 0;

  // Page tracking: pages[] holds per-page text (PDF path). Approximate by position.
  const pageForChar = (pos: number): number | undefined => {
    if (!opts.pages || opts.pages.length === 0) return undefined;
    let acc = 0;
    for (let p = 0; p < opts.pages.length; p++) {
      acc += opts.pages[p].length + 2;
      if (pos <= acc) return p + 1;
    }
    return opts.pages.length;
  };

  const pushChunks = (text: string, section?: string) => {
    for (const body of chunkBody(text, charOffset)) {
      const start = charOffset;
      const end = start + body.length;
      chunks.push({
        index: chunks.length,
        text: body,
        section,
        page: pageForChar(start),
        startChar: start,
        endChar: end,
      });
      charOffset = end;
    }
  };

  for (const b of blocks) {
    const section = b.heading ? b.heading.title : undefined;
    pushChunks(b.text, section);
  }

  const normalizedBlocks: ParsedBlock[] = blocks.map((b) => ({
    level: b.heading?.level ?? 0,
    title: b.heading?.title,
    text: b.text,
  }));

  return { chunks, outline, blocks: normalizedBlocks };
}
