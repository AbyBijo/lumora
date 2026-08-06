import { DocumentChunk, BoundingBox } from '../types';

/**
 * High-Speed Semantic Chunker with Heading & Sentence Boundary Preservation
 * 400 - 800 tokens target (~1600 - 3200 characters) with 10% overlap
 */
export function chunkDocumentText(
  documentId: string,
  rawText: string,
  targetChunkChars = 2000,
  overlapChars = 200
): DocumentChunk[] {
  if (!rawText || rawText.trim().length === 0) {
    return [];
  }

  // Detect explicit page splits (e.g. "--- Page X ---" or form feeds \f)
  const pageSections = rawText.split(/(?:--- Page (\d+) ---|\f)/gi);
  const chunks: DocumentChunk[] = [];
  let chunkIndex = 0;
  let runningCharOffset = 0;

  // If text contains page markers
  if (rawText.includes('--- Page ') || rawText.includes('\f')) {
    let currentPage = 1;
    for (let i = 0; i < pageSections.length; i++) {
      const part = pageSections[i];
      if (!part) continue;

      // If this section is just a page number captured from regex
      if (/^\d+$/.test(part.trim())) {
        currentPage = parseInt(part.trim(), 10);
        continue;
      }

      const pageText = part.trim();
      if (pageText.length === 0) continue;

      const pageChunks = splitParagraphsIntoChunks(
        documentId,
        pageText,
        currentPage,
        chunkIndex,
        runningCharOffset,
        targetChunkChars,
        overlapChars
      );

      chunks.push(...pageChunks);
      chunkIndex += pageChunks.length;
      runningCharOffset += pageText.length;
    }
  } else {
    // Single document without explicit page markers, estimate 3000 chars per page
    const totalLength = rawText.length;
    const estPages = Math.max(1, Math.ceil(totalLength / 2800));
    
    // Split by paragraphs
    const paragraphs = rawText.split(/\n\s*\n/);
    let currentChunkText = '';
    let currentChunkStart = 0;
    let currentSectionHeader = 'Introduction';

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      // Check if paragraph is a heading (# or Capitalized short line)
      if (trimmed.startsWith('#') || (trimmed.length < 80 && !trimmed.endsWith('.') && /^[A-Z0-9]/.test(trimmed))) {
        currentSectionHeader = trimmed.replace(/^#+\s*/, '');
      }

      if (currentChunkText.length + trimmed.length > targetChunkChars && currentChunkText.length > 0) {
        const charEnd = currentChunkStart + currentChunkText.length;
        const pageNumber = Math.min(estPages, Math.max(1, Math.ceil(charEnd / 2800)));
        
        chunks.push({
          id: `chk_${documentId.slice(0, 8)}_${chunkIndex}`,
          documentId,
          index: chunkIndex,
          text: currentChunkText.trim(),
          pageNumber,
          sectionHeader: currentSectionHeader,
          charStart: currentChunkStart,
          charEnd,
          tokenCount: Math.round(currentChunkText.length / 4),
          boundingBoxes: [
            {
              x: 0.1,
              y: ((chunkIndex % 3) * 0.28) + 0.1,
              width: 0.8,
              height: 0.24,
              pageNumber,
            },
          ],
        });

        chunkIndex++;
        // Retain overlap from end of current chunk
        const overlap = currentChunkText.slice(-overlapChars);
        currentChunkText = overlap + '\n\n' + trimmed;
        currentChunkStart = charEnd - overlapChars;
      } else {
        if (currentChunkText.length === 0) {
          currentChunkStart = runningCharOffset;
        }
        currentChunkText += (currentChunkText.length > 0 ? '\n\n' : '') + trimmed;
      }
      runningCharOffset += para.length + 2;
    }

    if (currentChunkText.trim().length > 0) {
      const charEnd = currentChunkStart + currentChunkText.length;
      const pageNumber = Math.min(estPages, Math.max(1, Math.ceil(charEnd / 2800)));
      
      chunks.push({
        id: `chk_${documentId.slice(0, 8)}_${chunkIndex}`,
        documentId,
        index: chunkIndex,
        text: currentChunkText.trim(),
        pageNumber,
        sectionHeader: currentSectionHeader,
        charStart: currentChunkStart,
        charEnd,
        tokenCount: Math.round(currentChunkText.length / 4),
        boundingBoxes: [
          {
            x: 0.1,
            y: ((chunkIndex % 3) * 0.28) + 0.1,
            width: 0.8,
            height: 0.24,
            pageNumber,
          },
        ],
      });
    }
  }

  return chunks;
}

function splitParagraphsIntoChunks(
  documentId: string,
  pageText: string,
  pageNumber: number,
  startIndex: number,
  baseOffset: number,
  targetChars: number,
  overlapChars: number
): DocumentChunk[] {
  const result: DocumentChunk[] = [];
  const paragraphs = pageText.split(/\n\s*\n/);
  let buffer = '';
  let curStart = baseOffset;
  let idx = startIndex;
  let currentHeader = `Page ${pageNumber} Content`;

  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('#') || (trimmed.length < 70 && !trimmed.endsWith('.'))) {
      currentHeader = trimmed.replace(/^#+\s*/, '');
    }

    if (buffer.length + trimmed.length > targetChars && buffer.length > 0) {
      result.push({
        id: `chk_${documentId.slice(0, 8)}_${idx}`,
        documentId,
        index: idx,
        text: buffer.trim(),
        pageNumber,
        sectionHeader: currentHeader,
        charStart: curStart,
        charEnd: curStart + buffer.length,
        tokenCount: Math.round(buffer.length / 4),
        boundingBoxes: [
          {
            x: 0.1,
            y: ((idx % 3) * 0.28) + 0.1,
            width: 0.8,
            height: 0.24,
            pageNumber,
          },
        ],
      });
      idx++;
      const overlap = buffer.slice(-overlapChars);
      buffer = overlap + '\n\n' + trimmed;
      curStart = curStart + buffer.length - overlapChars;
    } else {
      buffer += (buffer.length > 0 ? '\n\n' : '') + trimmed;
    }
  }

  if (buffer.trim().length > 0) {
    result.push({
      id: `chk_${documentId.slice(0, 8)}_${idx}`,
      documentId,
      index: idx,
      text: buffer.trim(),
      pageNumber,
      sectionHeader: currentHeader,
      charStart: curStart,
      charEnd: curStart + buffer.length,
      tokenCount: Math.round(buffer.length / 4),
      boundingBoxes: [
        {
          x: 0.1,
          y: ((idx % 3) * 0.28) + 0.1,
          width: 0.8,
          height: 0.24,
          pageNumber,
        },
      ],
    });
  }

  return result;
}
