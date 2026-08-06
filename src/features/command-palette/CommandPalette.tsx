'use client';

import React, { useState, useEffect } from 'react';
import { DocumentSource, StudyActionType } from '@/shared/types';
import {
  IconSearch,
  IconDocument,
  IconBrainSummary,
  IconExplain,
  IconFlashcard,
  IconQuiz,
  IconCornellNotes,
  IconCompare,
  IconTimeline,
  IconMindMap,
  IconUpload,
  IconSettings,
  IconSun,
  IconMoon,
  IconSparkles,
} from '@/shared/icons';
import { useTheme } from '@/shared/theme/ThemeProvider';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentSource[];
  onSelectDocument: (id: string) => void;
  onTriggerStudyAction: (action: StudyActionType) => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  documents,
  onSelectDocument,
  onTriggerStudyAction,
  onOpenUpload,
  onOpenSettings,
  onOpenOnboarding,
}) => {
  const [query, setQuery] = useState('');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-elevated border border-strong w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3 border-b border-subtle">
          <IconSearch size={18} className="text-lumora-text-muted mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, action, or document title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-lumora-text-primary placeholder:text-lumora-text-muted focus:outline-none"
          />
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-subtle text-lumora-text-muted">
            ESC
          </span>
        </div>

        {/* Actions List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1 text-xs">
          {/* Study Actions Section */}
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-lumora-text-muted">
            Study Actions
          </div>

          <button
            onClick={() => {
              onTriggerStudyAction('summarize');
              onClose();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-lumora-text-primary hover:bg-surface text-left transition-colors"
          >
            <IconBrainSummary size={15} className="text-lumora-accent" />
            <span>Generate Executive Summary & Outline</span>
          </button>

          <button
            onClick={() => {
              onTriggerStudyAction('explain_eli5');
              onClose();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-lumora-text-primary hover:bg-surface text-left transition-colors"
          >
            <IconExplain size={15} className="text-amber-600" />
            <span>Explain Like I'm Five (ELI5 Analogy)</span>
          </button>

          <button
            onClick={() => {
              onTriggerStudyAction('flashcards');
              onClose();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-lumora-text-primary hover:bg-surface text-left transition-colors"
          >
            <IconFlashcard size={15} className="text-emerald-600" />
            <span>Study Spaced-Repetition Flashcards</span>
          </button>

          <button
            onClick={() => {
              onTriggerStudyAction('quiz');
              onClose();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-lumora-text-primary hover:bg-surface text-left transition-colors"
          >
            <IconQuiz size={15} className="text-purple-600" />
            <span>Take Active Recall Verification Quiz</span>
          </button>

          <button
            onClick={() => {
              onTriggerStudyAction('cornell_notes');
              onClose();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-lumora-text-primary hover:bg-surface text-left transition-colors"
          >
            <IconCornellNotes size={15} className="text-indigo-600" />
            <span>Open Cornell Study Notes</span>
          </button>

          <button
            onClick={() => {
              onTriggerStudyAction('mind_map');
              onClose();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-lumora-text-primary hover:bg-surface text-left transition-colors"
          >
            <IconMindMap size={15} className="text-cyan-600" />
            <span>View Knowledge Graph & Concept Map</span>
          </button>

          {/* Quick System Actions */}
          <div className="px-2 pt-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-lumora-text-muted">
            Workspace & Navigation
          </div>

          <button
            onClick={() => {
              onOpenOnboarding();
              onClose();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-lumora-text-primary hover:bg-surface text-left transition-colors"
          >
            <IconSparkles size={15} className="text-amber-600" />
            <span>Open Lumora Onboarding Walkthrough & Philosophy Tour</span>
          </button>

          <button
            onClick={() => {
              onOpenUpload();
              onClose();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-lumora-text-primary hover:bg-surface text-left transition-colors"
          >
            <IconUpload size={15} className="text-lumora-accent" />
            <span>Add Source Material (PDF, DOCX, OCR, YouTube)</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-lumora-text-primary hover:bg-surface text-left transition-colors"
          >
            <IconSettings size={15} className="text-lumora-text-muted" />
            <span>Open BYOK API Keys & Providers</span>
          </button>

          <button
            onClick={() => {
              toggleTheme();
              onClose();
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-lumora-text-primary hover:bg-surface text-left transition-colors"
          >
            {theme === 'light' ? <IconMoon size={15} /> : <IconSun size={15} />}
            <span>Toggle Theme ({theme === 'light' ? 'Premium Dark' : 'Warm Light'})</span>
          </button>

          {/* Documents Section */}
          {filteredDocs.length > 0 && (
            <>
              <div className="px-2 pt-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-lumora-text-muted">
                Documents ({filteredDocs.length})
              </div>
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelectDocument(doc.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-lumora-text-primary hover:bg-surface text-left transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <IconDocument size={15} className="text-lumora-text-muted flex-shrink-0" />
                    <span className="truncate">{doc.title}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-lumora-text-muted flex-shrink-0 ml-2">
                    {doc.format}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
