'use client';

import * as React from 'react';

/**
 * Tiny, dependency-free markdown-ish renderer for lesson content.
 * Supports paragraphs, headings, bold, italics, inline code, lists, and
 * blockquotes — enough for generated lesson text without pulling in a
 * full markdown stack (see docs/adr/0006-lightweight-rendering.md).
 */

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) parts.push(<strong key={`${keyPrefix}-${i}`}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) parts.push(<code key={`${keyPrefix}-${i}`} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{tok.slice(1, -1)}</code>);
    else parts.push(<em key={`${keyPrefix}-${i}`}>{tok.slice(1, -1)}</em>);
    i++;
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let list: string[] | null = null;
  let listOrdered = false;
  let key = 0;

  const flushList = () => {
    if (list === null) return;
    blocks.push(
      listOrdered ? (
        <ol key={key++} className="my-2 list-decimal space-y-1 pl-5 marker:text-muted-foreground">
          {list.map((li, i) => (
            <li key={i}>{inline(li, `li${key}-${i}`)}</li>
          ))}
        </ol>
      ) : (
        <ul key={key++} className="my-2 list-disc space-y-1 pl-5 marker:text-muted-foreground">
          {list.map((li, i) => (
            <li key={i}>{inline(li, `li${key}-${i}`)}</li>
          ))}
        </ul>
      )
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const mOrdered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const mBullet = line.match(/^\s*[-•]\s+(.*)$/);
    if (mOrdered || mBullet) {
      if (list === null) {
        list = [];
        listOrdered = Boolean(mOrdered);
      }
      list.push((mOrdered ?? mBullet)![1]);
      continue;
    }
    flushList();

    if (!line.trim()) continue;
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      const cls = lvl === 1 ? 'text-lg font-semibold mt-5 mb-2' : lvl === 2 ? 'text-base font-semibold mt-4 mb-2' : 'text-sm font-semibold mt-3 mb-1.5';
      blocks.push(
        <h2 key={key++} className={cls}>
          {inline(h[2], `h${key}`)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={key++} className="my-2 border-l-2 border-primary/40 pl-3 text-muted-foreground">
          {inline(line.slice(2), `q${key}`)}
        </blockquote>
      );
      continue;
    }
    blocks.push(<p key={key++} className="my-2 leading-relaxed">{inline(line, `p${key}`)}</p>);
  }
  flushList();

  return <div className={className}>{blocks}</div>;
}
