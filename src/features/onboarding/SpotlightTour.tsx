'use client';

import React, { useState } from 'react';
import {
  IconSparkles,
  IconCheck,
  IconChevronRight,
  IconX,
  IconDocument,
  IconBrainSummary,
  IconFlashcard,
  IconSearch,
} from '@/shared/icons';

interface SpotlightTourProps {
  isActive: boolean;
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    title: '1. Ingestion & Document Library',
    description:
      'The left sidebar holds your workspaces, folders, and multi-format sources (PDFs, DOCX, Markdown, OCR image scans, and YouTube transcripts). Use the filter tags to quickly organize your study materials.',
    icon: IconDocument,
    badge: 'Left Sidebar',
  },
  {
    step: 2,
    title: '2. Grounded Document Reader',
    description:
      'The top canvas renders your document. Selecting any text displays a contextual study tool (ELI5 explanation, Advanced breakdown, or instant Flashcard generation). Clicking citation badges anywhere in the app scrolls the reader to the exact highlighted paragraph.',
    icon: IconDocument,
    badge: 'Center Canvas',
  },
  {
    step: 3,
    title: '3. Grounded AI Reasoning Studio',
    description:
      'The bottom reasoning deck lets you ask deep conceptual questions. Every answer is grounded in your source chunks with verified [ref:p#] citation badges. It never dumps entire documents to external clouds.',
    icon: IconBrainSummary,
    badge: 'Bottom Studio',
  },
  {
    step: 4,
    title: '4. Active Recall & Study Action Runners',
    description:
      'The right inspector houses dedicated study action runners: SuperMemo SM-2 Flashcards with 3D flips, Adaptive Diagnostic Quizzes, 3-part Cornell Notes, Side-by-Side Concept Matrices, and Knowledge Mind Maps.',
    icon: IconFlashcard,
    badge: 'Right Inspector',
  },
  {
    step: 5,
    title: '5. Universal Keyboard Ergonomics',
    description:
      'Press Cmd+K / Ctrl+K anytime to open the omni-search Command Palette. Use Cmd+\\ to toggle the sidebar, Cmd+Shift+\\ for the study panel, and Cmd+Opt+Z for Zen Focus Mode.',
    icon: IconSearch,
    badge: 'Keyboard Fast Track',
  },
];

export const SpotlightTour: React.FC<SpotlightTourProps> = ({ isActive, onComplete }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isActive) return null;

  const currentStep = TOUR_STEPS[currentStepIdx]!;
  const isLast = currentStepIdx === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStepIdx((i) => i + 1);
    }
  };

  const CurrentIcon = currentStep.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-scale-in">
      <div className="bg-elevated border-2 border-lumora-accent rounded-2xl shadow-2xl p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-subtle pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-lumora-accent text-white flex items-center justify-center">
              <CurrentIcon size={15} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-lumora-accent-subtle text-lumora-accent font-bold">
                {currentStep.badge}
              </span>
              <h4 className="text-xs font-bold text-lumora-text-primary mt-0.5">
                {currentStep.title}
              </h4>
            </div>
          </div>

          <button
            onClick={onComplete}
            title="Dismiss Tour"
            className="p-1 rounded text-lumora-text-muted hover:text-lumora-text-primary hover:bg-surface"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs font-editorial leading-relaxed text-lumora-text-secondary">
          {currentStep.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex space-x-1">
            {TOUR_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIdx
                    ? 'w-5 bg-lumora-accent'
                    : idx < currentStepIdx
                    ? 'w-2 bg-lumora-accent/40'
                    : 'w-2 bg-subtle'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {currentStepIdx > 0 && (
              <button
                onClick={() => setCurrentStepIdx((i) => Math.max(0, i - 1))}
                className="text-xs px-2.5 py-1 rounded-lg border border-subtle bg-canvas text-lumora-text-secondary hover:text-lumora-text-primary"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="text-xs px-3.5 py-1 rounded-lg bg-lumora-accent text-white font-medium hover:bg-lumora-accent-hover flex items-center space-x-1 shadow-xs"
            >
              <span>{isLast ? 'Finish Tour' : 'Next Step'}</span>
              {isLast ? <IconCheck size={13} /> : <IconChevronRight size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
