'use client';

import React from 'react';
import { ConceptComparisonData, DocumentSource } from '@/shared/types';
import { IconCompare, IconX } from '@/shared/icons';

interface ConceptComparisonViewProps {
  document: DocumentSource;
  comparisonData: ConceptComparisonData;
  onClose: () => void;
}

export const ConceptComparisonView: React.FC<ConceptComparisonViewProps> = ({
  document,
  comparisonData,
  onClose,
}) => {
  return (
    <div className="h-full flex flex-col bg-surface p-4 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-subtle">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
            <IconCompare size={16} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-lumora-text-primary">Comparative Matrix</h3>
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

      {/* Overview */}
      <div className="bg-elevated border border-subtle rounded-xl p-3.5 shadow-xs">
        <h4 className="text-xs font-semibold text-lumora-text-primary mb-1">{comparisonData.title}</h4>
        <p className="text-xs font-editorial text-lumora-text-secondary leading-relaxed">
          {comparisonData.overview}
        </p>
      </div>

      {/* Side-by-side Matrix Table */}
      <div className="border border-subtle rounded-xl overflow-hidden bg-elevated shadow-xs">
        <div className="grid grid-cols-3 bg-surface border-b border-subtle text-[11px] font-semibold text-lumora-text-primary p-2.5">
          <div>Dimension</div>
          <div className="text-lumora-accent">{comparisonData.conceptAName}</div>
          <div className="text-teal-600">{comparisonData.conceptBName}</div>
        </div>

        <div className="divide-y divide-subtle">
          {comparisonData.rows.map((row, idx) => (
            <div key={idx} className="p-3 text-xs space-y-1.5 hover:bg-surface/30 transition-colors">
              <div className="font-semibold text-lumora-text-primary text-[11px] uppercase tracking-wider">
                {row.attribute}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-surface/50 border border-subtle">
                  <span className="font-medium text-[10px] uppercase text-lumora-text-muted block mb-0.5">
                    {comparisonData.conceptAName}
                  </span>
                  <p className="text-lumora-text-primary font-editorial">{row.conceptA}</p>
                </div>

                <div className="p-2 rounded bg-surface/50 border border-subtle">
                  <span className="font-medium text-[10px] uppercase text-lumora-text-muted block mb-0.5">
                    {comparisonData.conceptBName}
                  </span>
                  <p className="text-lumora-text-primary font-editorial">{row.conceptB}</p>
                </div>
              </div>
              <p className="text-[11px] text-lumora-text-muted italic pt-1">
                Nuance: {row.nuance}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Synthesis */}
      <div className="p-3.5 bg-lumora-accent-subtle rounded-xl border border-lumora-accent/20">
        <span className="text-[10px] font-mono uppercase tracking-wider text-lumora-accent font-semibold block mb-1">
          Architectural Synthesis
        </span>
        <p className="text-xs font-editorial text-lumora-text-primary leading-relaxed">
          {comparisonData.synthesis}
        </p>
      </div>
    </div>
  );
};
