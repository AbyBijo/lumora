'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DocumentSource, DocumentChunk } from '@/shared/types';
import {
  IconDocument,
  IconSearch,
  IconChevronRight,
  IconChevronDown,
  IconCitation,
  IconSparkles,
  IconFlashcard,
  IconCornellNotes,
  IconExplain,
} from '@/shared/icons';

interface DocumentViewerProps {
  document: DocumentSource | null;
  targetCitationChunkId: string | null;
  onTextActionTriggered?: (action: 'explain_eli5' | 'explain_advanced' | 'flashcard' | 'cornell_notes', selectedText: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  targetCitationChunkId,
  onTextActionTriggered,
}) => {
  const [activePage, setActivePage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // When targetCitationChunkId changes, scroll to corresponding chunk/page
  useEffect(() => {
    if (!targetCitationChunkId || !document) return;
    const targetChunk = document.chunks.find((c) => c.id === targetCitationChunkId);
    if (targetChunk) {
      setActivePage(targetChunk.pageNumber);
      const el = window.document.getElementById(`chunk-${targetChunk.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [targetCitationChunkId, document]);

  // Handle text selection in document
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionPosition(null);
      setSelectedText('');
      return;
    }

    const text = selection.toString().trim();
    if (text.length > 5) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setSelectionPosition({
        x: Math.min(window.innerWidth - 260, Math.max(10, rect.left + rect.width / 2 - 120)),
        y: rect.top - 46,
      });
    } else {
      setSelectionPosition(null);
    }
  };

  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-lumora-text-muted bg-canvas">
        <div className="w-12 h-12 rounded-full bg-surface border border-subtle flex items-center justify-center mb-3">
          <IconDocument size={24} className="text-lumora-text-muted" />
        </div>
        <h3 className="text-sm font-medium text-lumora-text-primary">No Document Selected</h3>
        <p className="text-xs text-lumora-text-secondary mt-1 max-w-sm">
          Select a source document from the left library or upload research papers, lecture notes, or YouTube transcripts.
        </p>
      </div>
    );
  }

  // Filter chunks by page if multi-page, or render all chunks sequentially
  const pageChunks = document.chunks.filter((c) => c.pageNumber === activePage);

  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      className="h-full flex flex-col bg-canvas select-text relative overflow-hidden"
    >
      {/* Top Toolbar */}
      <div className="h-12 px-4 border-b border-subtle bg-surface/80 backdrop-blur-sm flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <span className="text-xs font-semibold text-lumora-text-primary truncate">
            {document.title}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface border border-subtle text-lumora-text-secondary">
            {document.format}
          </span>
        </div>

        {/* Page Navigator & Zoom Controls */}
        <div className="flex items-center space-x-3 text-xs text-lumora-text-secondary">
          {/* Page Controls */}
          {document.pageCount > 1 && (
            <div className="flex items-center space-x-1 bg-canvas px-2 py-1 rounded-md border border-subtle">
              <button
                disabled={activePage <= 1}
                onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                className="px-1.5 hover:text-lumora-text-primary disabled:opacity-40"
              >
                ◀
              </button>
              <span className="text-[11px] font-mono">
                Page {activePage} of {document.pageCount}
              </span>
              <button
                disabled={activePage >= document.pageCount}
                onClick={() => setActivePage((p) => Math.min(document.pageCount, p + 1))}
                className="px-1.5 hover:text-lumora-text-primary disabled:opacity-40"
              >
                ▶
              </button>
            </div>
          )}

          {/* Zoom Level */}
          <div className="flex items-center space-x-1 bg-canvas px-2 py-1 rounded-md border border-subtle text-[11px] font-mono">
            <button
              onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
              className="px-1 hover:text-lumora-text-primary"
            >
              -
            </button>
            <span>{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
              className="px-1 hover:text-lumora-text-primary"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Floating Selection Action Toolbar */}
      {selectionPosition && selectedText && (
        <div
          style={{ top: `${selectionPosition.y}px`, left: `${selectionPosition.x}px` }}
          className="fixed z-50 flex items-center space-x-1 bg-elevated border border-strong rounded-lg shadow-xl p-1 animate-scale-in"
        >
          <button
            onClick={() => {
              onTextActionTriggered?.('explain_eli5', selectedText);
              setSelectionPosition(null);
            }}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-surface text-xs text-lumora-text-primary font-medium"
            title="Explain Like I'm Five"
          >
            <IconExplain size={13} className="text-lumora-accent" />
            <span>ELI5</span>
          </button>
          <div className="w-[1px] h-4 bg-subtle" />
          <button
            onClick={() => {
              onTextActionTriggered?.('explain_advanced', selectedText);
              setSelectionPosition(null);
            }}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-surface text-xs text-lumora-text-primary font-medium"
            title="Rigorous Advanced Breakdown"
          >
            <IconSparkles size={13} className="text-blue-500" />
            <span>Advanced</span>
          </button>
          <div className="w-[1px] h-4 bg-subtle" />
          <button
            onClick={() => {
              onTextActionTriggered?.('flashcard', selectedText);
              setSelectionPosition(null);
            }}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-surface text-xs text-lumora-text-primary font-medium"
            title="Generate Flashcard Deck"
          >
            <IconFlashcard size={13} className="text-amber-500" />
            <span>Card</span>
          </button>
          <div className="w-[1px] h-4 bg-subtle" />
          <button
            onClick={() => {
              onTextActionTriggered?.('cornell_notes', selectedText);
              setSelectionPosition(null);
            }}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-surface text-xs text-lumora-text-primary font-medium"
            title="Add to Cornell Notes"
          >
            <IconCornellNotes size={13} className="text-emerald-500" />
            <span>Note</span>
          </button>
        </div>
      )}

      {/* Main Document Reading Canvas */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
        <div
          style={{ fontSize: `${zoomLevel}%` }}
          className="w-full max-w-3xl bg-elevated border border-subtle rounded-xl shadow-sm p-6 md:p-12 space-y-6 transition-all duration-150"
        >
          {/* Document Header Block */}
          <div className="border-b border-subtle pb-4">
            <h1 className="text-2xl md:text-3xl font-bold font-editorial text-lumora-text-primary tracking-tight">
              {document.title}
            </h1>
            <div className="flex items-center space-x-3 text-xs text-lumora-text-muted mt-2 font-mono">
              <span>{document.originalFileName}</span>
              <span>•</span>
              <span>SHA-256: {document.sha256Hash.slice(0, 12)}...</span>
              <span>•</span>
              <span>{document.chunks.length} Semantic Chunks</span>
            </div>
          </div>

          {/* Render Active Page Chunks */}
          <div className="space-y-6">
            {(pageChunks.length > 0 ? pageChunks : document.chunks).map((chunk) => {
              const isTargetCitation = targetCitationChunkId === chunk.id;
              return (
                <div
                  key={chunk.id}
                  id={`chunk-${chunk.id}`}
                  className={`p-3 rounded-lg transition-all duration-300 relative group ${
                    isTargetCitation
                      ? 'citation-target-pulse bg-lumora-citation/40'
                      : 'hover:bg-surface/40'
                  }`}
                >
                  {chunk.sectionHeader && (
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-lumora-accent font-sans">
                        {chunk.sectionHeader}
                      </span>
                      <span className="text-[10px] font-mono text-lumora-text-muted">
                        Page {chunk.pageNumber} • #{chunk.index + 1}
                      </span>
                    </div>
                  )}

                  <div className="font-editorial text-sm md:text-base leading-relaxed text-lumora-text-primary whitespace-pre-wrap">
                    {chunk.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
