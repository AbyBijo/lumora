'use client';

import React, { useState } from 'react';
import { CornellNotesData, DocumentSource } from '@/shared/types';
import { IconCornellNotes, IconExport, IconCitation, IconX } from '@/shared/icons';

interface CornellNotesViewProps {
  document: DocumentSource;
  notesData: CornellNotesData;
  onCitationClicked: (chunkId: string, pageNumber: number) => void;
  onClose: () => void;
}

export const CornellNotesView: React.FC<CornellNotesViewProps> = ({
  document,
  notesData,
  onCitationClicked,
  onClose,
}) => {
  const [cues, setCues] = useState(notesData.cues);
  const [summary, setSummary] = useState(notesData.summary);

  const handleExportMarkdown = () => {
    let md = `# Cornell Notes: ${notesData.title}\n\n`;
    md += `**Source Document:** ${document.title} (${document.originalFileName})\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n\n`;
    md += `## 1. Cues & Key Concepts\n\n`;

    cues.forEach((c) => {
      md += `### ❓ ${c.cue} ${c.pageNumber ? `(Page ${c.pageNumber})` : ''}\n`;
      md += `${c.note}\n\n`;
    });

    md += `## 2. Summary\n\n${summary}\n\n`;
    md += `## 3. Key Terms\n\n`;
    notesData.keyTerms.forEach((t) => (md += `- **${t}**\n`));

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `Cornell_Notes_${document.title.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-surface p-4 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-subtle">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <IconCornellNotes size={16} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-lumora-text-primary">Cornell Study Notes</h3>
            <p className="text-[10px] text-lumora-text-muted">{notesData.title}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleExportMarkdown}
            className="flex items-center space-x-1 text-xs px-2 py-1 rounded bg-elevated border border-subtle hover:border-lumora-accent text-lumora-text-secondary hover:text-lumora-text-primary transition-colors"
            title="Download as Markdown"
          >
            <IconExport size={13} />
            <span>Export .md</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-lumora-text-muted hover:text-lumora-text-primary hover:bg-elevated"
          >
            <IconX size={16} />
          </button>
        </div>
      </div>

      {/* Cornell Grid System: Cues (Left) + Notes (Right) */}
      <div className="space-y-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-lumora-text-muted flex justify-between px-1">
          <span>Recall Cues / Questions</span>
          <span>Detailed Synthesis Notes</span>
        </div>

        {cues.map((item, idx) => (
          <div
            key={item.id}
            className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-elevated border border-subtle rounded-xl shadow-xs"
          >
            {/* Cue Column */}
            <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-subtle pb-2 md:pb-0 md:pr-3">
              <span className="text-xs font-semibold text-lumora-accent block mb-1">
                {item.cue}
              </span>
              {item.pageNumber && (
                <button
                  onClick={() => onCitationClicked(document.chunks[0]?.id || 'chk', item.pageNumber!)}
                  className="flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded bg-lumora-citation/50 hover:bg-lumora-citation text-lumora-text-primary font-mono"
                >
                  <IconCitation size={10} className="text-amber-700" />
                  <span>Page {item.pageNumber}</span>
                </button>
              )}
            </div>

            {/* Note Column */}
            <div className="md:col-span-2 pt-1 md:pt-0">
              <p className="text-xs font-editorial leading-relaxed text-lumora-text-primary whitespace-pre-wrap">
                {item.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="p-4 bg-elevated border border-strong rounded-xl shadow-xs space-y-2">
        <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 font-semibold block">
          Cornell Summary Block
        </span>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full text-xs font-editorial bg-surface/50 p-2 rounded-lg border border-subtle text-lumora-text-primary focus:outline-none focus:border-lumora-accent resize-none"
        />
      </div>

      {/* Key Terms */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {notesData.keyTerms.map((term, tIdx) => (
          <span
            key={tIdx}
            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-subtle text-lumora-text-secondary"
          >
            #{term}
          </span>
        ))}
      </div>
    </div>
  );
};
