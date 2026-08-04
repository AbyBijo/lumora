/** Text utilities shared by the parsing & generation pipeline. */

const STOPWORDS = new Set(
  `a about above after again against all am an and any are aren't as at be because been before
   being below between both but by can't cannot could couldn't did didn't do does doesn't doing
   don't down during each few for from further had hadn't has hasn't have haven't having he he'd
   he'll he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into
   is isn't it it's its itself let's me more most mustn't my myself no nor not of off on once only
   or other ought our ours ourselves out over own same shan't she she'd she'll she's should
   shouldn't so some such than that that's the their theirs them themselves then there there's
   these they they'd they'll they're they've this those through to too under until up very was
   wasn't we we'd we'll we're we've were weren't what what's when when's where where's which while
   who who's whom why why's with won't would wouldn't you you'd you'll you're you've your yours
   yourself yourselves this that these those from their have been will can may might must shall
   etc e.g i.e us via plus per`.split(/\s+/)
);

export function isStopword(w: string): boolean {
  return STOPWORDS.has(w.toLowerCase());
}

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z'-]{1,}/g) ?? [];
}

/** Split text into sentences (keeps punctuation). */
export function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  // Split on sentence boundaries but keep abbreviations like "e.g." intact-ish.
  const parts = cleaned.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/);
  return parts
    .map((p) => p.trim())
    .filter((p) => p.length > 1 && !/^[.!?]+$/.test(p));
}

/** Heuristic heading detection. */
export function isHeadingLine(line: string, _idx: number, _lines: string[]): boolean {
  const t = line.trim();
  if (!t) return false;
  if (/^#{1,6}\s/.test(t)) return true;
  if (t.length > 120) return false;
  if (/[.!?]$/.test(t) && !/^[0-9]+[.)]\s/.test(t)) return false; // sentence-like
  // Numbered section: "1. Introduction", "2.3 The Cell"
  if (/^\d+(\.\d+)*[.)]?\s+[A-Z]/.test(t)) return true;
  // Short lines where every word is title-cased: "The Testing Effect",
  // "Working Memory", "Introduction". A sentence like "This study shows
  // results" has lowercase words and is rejected.
  const words = t.split(/\s+/);
  const alpha = words.filter((w) => /[A-Za-z]/.test(w)).length;
  if (words.length <= 8 && alpha === words.length && t.length >= 4) {
    const titleCased = words.filter((w) => /^[A-Z]/.test(w)).length;
    if (titleCased === words.length) return true;
  }
  return false;
}

export function stripMarkdownHeading(t: string): string {
  return t.replace(/^#{1,6}\s*/, '').trim();
}

export function headingLevel(t: string): number {
  const m = t.match(/^(#{1,6})\s/);
  return m ? m[1].length : 2; // plain detected headings treated as h2
}

/** Plain-text→HTML escaping for safe rendering. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
