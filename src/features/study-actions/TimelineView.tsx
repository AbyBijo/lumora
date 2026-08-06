'use client';

import React from 'react';
import { TimelineEvent, DocumentSource } from '@/shared/types';
import { IconTimeline, IconCitation, IconX } from '@/shared/icons';

interface TimelineViewProps {
  document: DocumentSource;
  events: TimelineEvent[];
  onCitationClicked: (chunkId: string, pageNumber: number) => void;
  onClose: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  document,
  events,
  onCitationClicked,
  onClose,
}) => {
  return (
    <div className="h-full flex flex-col bg-surface p-4 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-subtle">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <IconTimeline size={16} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-lumora-text-primary">Execution Timeline</h3>
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

      {/* Vertical Timeline Track */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-strong">
        {events.map((event, idx) => (
          <div key={event.id} className="relative group">
            {/* Timeline Node Point */}
            <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-elevated border-2 border-rose-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>

            {/* Event Card */}
            <div className="bg-elevated border border-subtle rounded-xl p-3.5 shadow-xs space-y-1.5 hover:border-rose-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 font-semibold px-2 py-0.5 rounded bg-rose-500/10">
                  {event.dateOrStage}
                </span>
                <button
                  onClick={() => onCitationClicked(event.chunkId, event.pageNumber)}
                  className="flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded bg-lumora-citation/60 hover:bg-lumora-citation text-lumora-text-primary font-mono"
                >
                  <IconCitation size={10} className="text-amber-700" />
                  <span>Page {event.pageNumber}</span>
                </button>
              </div>

              <h4 className="text-xs font-semibold text-lumora-text-primary">
                {event.title}
              </h4>
              <p className="text-xs font-editorial text-lumora-text-secondary leading-snug">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
