import { describe, it, expect } from 'vitest';
import { splitSentences, isHeadingLine, tokenize, isStopword } from './text';

describe('splitSentences', () => {
  it('splits on sentence boundaries', () => {
    const s = splitSentences('Hello world. This is two. And three!');
    expect(s).toHaveLength(3);
  });

  it('keeps single sentences intact', () => {
    expect(splitSentences('Just one sentence here.')).toEqual(['Just one sentence here.']);
  });

  it('handles empty input', () => {
    expect(splitSentences('')).toEqual([]);
  });
});

describe('isHeadingLine', () => {
  it('detects markdown headings', () => {
    expect(isHeadingLine('# Title', 0, [])).toBe(true);
    expect(isHeadingLine('## Sub', 0, [])).toBe(true);
  });

  it('detects numbered sections', () => {
    expect(isHeadingLine('2. Memory Encoding', 0, [])).toBe(true);
    expect(isHeadingLine('2.3 The Cell', 0, [])).toBe(true);
  });

  it('rejects ordinary sentences', () => {
    expect(isHeadingLine('This is a normal sentence with many words in it.', 0, [])).toBe(false);
  });

  it('detects short capitalized lines', () => {
    expect(isHeadingLine('The Testing Effect', 0, [])).toBe(true);
  });
});

describe('tokenize & stopwords', () => {
  it('extracts lowercase tokens', () => {
    const t = tokenize('Spaced repetition works.');
    expect(t).toContain('spaced');
    expect(t).toContain('repetition');
  });

  it('flags common stopwords', () => {
    expect(isStopword('the')).toBe(true);
    expect(isStopword('Memory')).toBe(false);
  });
});
