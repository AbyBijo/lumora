import { describe, it, expect } from 'vitest';
import { chunkDocument } from './chunker';

const SAMPLE = `# The Science of Learning

## How Memory Works

Memory is the process by which information is encoded, stored, and later retrieved.
Working memory is the small amount of information that a person can hold in mind at one time.

## Spaced Repetition

Spaced repetition is the practice of reviewing material at gradually increasing intervals.
The spacing effect is one of the most robust findings in learning science.`;

describe('chunkDocument', () => {
  const { chunks, outline, blocks } = chunkDocument(SAMPLE);

  it('produces an outline from headings', () => {
    expect(outline[0]).toContain('The Science of Learning');
    expect(outline.some((o) => o.includes('How Memory Works'))).toBe(true);
  });

  it('produces structural blocks with levels', () => {
    const h2s = blocks.filter((b) => b.level === 2);
    expect(h2s).toHaveLength(2);
  });

  it('tags chunks with their section', () => {
    const mem = chunks.find((c) => c.section === 'How Memory Works');
    expect(mem?.text).toContain('encoded');
    const srs = chunks.find((c) => c.section === 'Spaced Repetition');
    expect(srs?.text).toContain('intervals');
  });

  it('chunks are contiguous and ordered', () => {
    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i].index).toBe(i);
      if (i > 0) expect(chunks[i].startChar).toBeGreaterThanOrEqual(chunks[i - 1].endChar);
    }
  });

  it('no chunk is absurdly large', () => {
    for (const c of chunks) expect(c.text.length).toBeLessThanOrEqual(1600);
  });
});
