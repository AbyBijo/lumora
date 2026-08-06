'use client';

import React, { useState } from 'react';
import { DocumentSource, Flashcard, QuizDeck, SummaryData, CornellNotesData } from '@/shared/types';
import { IconExport, IconX, IconCheck, IconDocument, IconFlashcard } from '@/shared/icons';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentSource | null;
  flashcards: Flashcard[];
  quizDeck: QuizDeck | null;
  summaryData: SummaryData | null;
  cornellNotes: CornellNotesData | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  document,
  flashcards,
  quizDeck,
  summaryData,
  cornellNotes,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const generateFullMarkdown = (): string => {
    let md = `# Lumora Study Guide: ${document.title}\n\n`;
    md += `**Original Source:** ${document.originalFileName}\n`;
    md += `**SHA-256 Fingerprint:** \`${document.sha256Hash}\`\n`;
    md += `**Date Generated:** ${new Date().toLocaleDateString()}\n\n`;

    if (summaryData) {
      md += `## 1. Executive Summary\n\n${summaryData.executiveSummary}\n\n`;
      md += `### Core Takeaways\n`;
      summaryData.coreTakeaways.forEach((t) => (md += `- ${t}\n`));
      md += `\n`;
    }

    if (cornellNotes) {
      md += `## 2. Cornell Synthesis Notes\n\n`;
      cornellNotes.cues.forEach((c) => {
        md += `### ❓ ${c.cue} ${c.pageNumber ? `(Page ${c.pageNumber})` : ''}\n`;
        md += `${c.note}\n\n`;
      });
      md += `**Summary:** ${cornellNotes.summary}\n\n`;
    }

    if (flashcards.length > 0) {
      md += `## 3. Active Recall Flashcards (${flashcards.length} Cards)\n\n`;
      flashcards.forEach((fc, idx) => {
        md += `**Q${idx + 1}: ${fc.front}** (Page ${fc.pageNumber})\n`;
        md += `> **Answer:** ${fc.back}\n\n`;
      });
    }

    return md;
  };

  const handleDownloadMarkdown = () => {
    const md = generateFullMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `Lumora_Study_Guide_${document.title.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleDownloadAnkiJSON = () => {
    const ankiDeck = {
      deckName: `Lumora :: ${document.title}`,
      createdAt: new Date().toISOString(),
      cards: flashcards.map((f) => ({
        front: f.front,
        back: f.back,
        tags: [document.format, f.keyConcept],
      })),
    };
    const blob = new Blob([JSON.stringify(ankiDeck, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `Anki_Deck_${document.title.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleCopyClipboard = () => {
    const md = generateFullMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-elevated border border-subtle w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-subtle">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-lumora-accent/10 text-lumora-accent flex items-center justify-center">
              <IconExport size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-lumora-text-primary">Export Study Guide</h3>
              <p className="text-xs text-lumora-text-secondary">Pristine Markdown, Anki JSON & PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-lumora-text-muted hover:text-lumora-text-primary hover:bg-surface"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Export Options */}
        <div className="p-6 space-y-3">
          <button
            onClick={handleDownloadMarkdown}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-surface border border-subtle hover:border-lumora-accent text-left transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-canvas text-lumora-accent">
                <IconDocument size={16} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-lumora-text-primary">Download Markdown (.md)</h4>
                <p className="text-[11px] text-lumora-text-muted">Cornell notes, summaries, and flashcards</p>
              </div>
            </div>
            <span className="text-xs text-lumora-accent group-hover:translate-x-0.5 transition-transform">➔</span>
          </button>

          <button
            onClick={handleDownloadAnkiJSON}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-surface border border-subtle hover:border-lumora-accent text-left transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-canvas text-emerald-600">
                <IconFlashcard size={16} />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-lumora-text-primary">Anki / Spaced Repetition JSON</h4>
                <p className="text-[11px] text-lumora-text-muted">Import directly into Anki or SuperMemo</p>
              </div>
            </div>
            <span className="text-xs text-lumora-accent group-hover:translate-x-0.5 transition-transform">➔</span>
          </button>

          <button
            onClick={handleCopyClipboard}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-surface border border-subtle hover:border-lumora-accent text-left transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-canvas text-indigo-600">
                {copied ? <IconCheck size={16} /> : <IconExport size={16} />}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-lumora-text-primary">
                  {copied ? 'Copied to Clipboard!' : 'Copy Formatted Markdown'}
                </h4>
                <p className="text-[11px] text-lumora-text-muted">Paste into Obsidian, Notion, or Bear</p>
              </div>
            </div>
            <span className="text-xs text-lumora-accent group-hover:translate-x-0.5 transition-transform">➔</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-subtle bg-surface flex justify-end">
          <button
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-lg bg-canvas border border-subtle text-lumora-text-secondary hover:text-lumora-text-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
