'use client';

import React from 'react';
import { SummaryData, DocumentSource } from '@/shared/types';
import { IconBrainSummary, IconCitation, IconX } from '@/shared/icons';

interface SummaryViewProps {
  document: DocumentSource;
  summaryData: SummaryData;
  onCitationClicked: (chunkId: string, pageNumber: number) => void;
  onClose: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  document,
  summaryData,
  onCitationClicked,
  onClose,
}) => {
  return (
    <div className="h-full flex flex-col bg-surface p-4 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-subtle">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-lumora-accent/10 text-lumora-accent flex items-center justify-center">
            <IconBrainSummary size={16} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-lumora-text-primary">Executive Summary</h3>
            <p className="text-[10px] text-lumora-text-muted">{document.title}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-lumora-text-muted hover:text-lumora-text-primary hover:bg-elevated"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Executive Distillation */}
      <div className="bg-elevated border border-subtle rounded-xl p-4 shadow-xs space-y-2">
        <span className="text-[10px] uppercase font-mono tracking-wider text-lumora-accent font-semibold">
          Core Thesis
        </span>
        <p className="text-xs md:text-sm font-editorial leading-relaxed text-lumora-text-primary">
          {summaryData.executiveSummary}
        </p>
      </div>

      {/* Core Takeaways */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-lumora-text-primary uppercase tracking-wider">
          Key Takeaways
        </h4>
        <div className="space-y-1.5">
          {summaryData.coreTakeaways.map((takeaway, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-2 p-2.5 bg-elevated border border-subtle rounded-lg text-xs text-lumora-text-secondary"
            >
              <span className="w-4 h-4 rounded-full bg-lumora-accent-subtle text-lumora-accent flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-snug">{takeaway}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Structural Outline with Jump Citations */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-lumora-text-primary uppercase tracking-wider">
          Chapter-by-Chapter Breakdown
        </h4>
        <div className="space-y-2">
          {summaryData.structuralOutline.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-elevated border border-subtle rounded-xl space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-lumora-text-primary">
                  {item.sectionTitle}
                </span>
                <button
                  onClick={() => onCitationClicked(document.chunks[0]?.id || 'chk', item.pageNumber)}
                  className="flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded bg-lumora-citation/60 hover:bg-lumora-citation text-lumora-text-primary font-mono"
                >
                  <IconCitation size={11} className="text-amber-700" />
                  <span>Page {item.pageNumber}</span>
                </button>
              </div>

              <p className="text-xs text-lumora-text-secondary leading-snug">
                {item.summary}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {item.keyPoints.map((pt, pIdx) => (
                  <span
                    key={pIdx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-surface text-lumora-text-muted border border-subtle"
                  >
                    • {pt}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
