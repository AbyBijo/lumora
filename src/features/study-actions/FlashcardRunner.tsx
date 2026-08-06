'use client';

import React, { useState, useEffect } from 'react';
import { Flashcard, DocumentSource } from '@/shared/types';
import { IconFlashcard, IconCitation, IconSparkles, IconCheck, IconX } from '@/shared/icons';
import confetti from 'canvas-confetti';

interface FlashcardRunnerProps {
  document: DocumentSource;
  flashcards: Flashcard[];
  onCitationClicked: (chunkId: string, pageNumber: number) => void;
  onClose: () => void;
}

export const FlashcardRunner: React.FC<FlashcardRunnerProps> = ({
  document,
  flashcards,
  onCitationClicked,
  onClose,
}) => {
  const [deck, setDeck] = useState<Flashcard[]>(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  useEffect(() => {
    setDeck(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setMasteredCount(0);
  }, [flashcards, document.id]);

  // Keyboard shortcut listener: Space to flip, 1-4 for ease rating
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (isFlipped) {
        if (e.key === '1') handleRateCard(1);
        if (e.key === '2') handleRateCard(2);
        if (e.key === '3') handleRateCard(3);
        if (e.key === '4') handleRateCard(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, isCompleted, deck]);

  const handleRateCard = (rating: 1 | 2 | 3 | 4) => {
    // SM-2 Spaced repetition calculation
    const currentCard = deck[currentIndex];
    if (!currentCard) return;

    let newInterval = currentCard.interval;
    let newEase = currentCard.easeFactor;

    if (rating >= 3) {
      setMasteredCount((m) => m + 1);
      newInterval = currentCard.repetition === 0 ? 1 : currentCard.repetition === 1 ? 6 : Math.round(currentCard.interval * newEase);
      newEase = Math.max(1.3, newEase + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
    } else {
      newInterval = 1;
    }

    setIsFlipped(false);

    if (currentIndex + 1 >= deck.length) {
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } else {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  const currentCard = deck[currentIndex];
  const progressPercent = Math.round(((currentIndex + (isCompleted ? 1 : 0)) / deck.length) * 100);

  return (
    <div className="h-full flex flex-col bg-surface p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-subtle">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <IconFlashcard size={16} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-lumora-text-primary">Active Recall Deck</h3>
            <p className="text-[10px] text-lumora-text-muted">SM-2 Spaced Repetition</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-lumora-text-muted hover:text-lumora-text-primary hover:bg-elevated"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="py-3">
        <div className="flex justify-between text-[11px] font-mono text-lumora-text-muted mb-1">
          <span>Card {Math.min(currentIndex + 1, deck.length)} of {deck.length}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden border border-subtle">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard Canvas */}
      {!isCompleted && currentCard ? (
        <div className="flex-1 flex flex-col justify-center my-2">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[220px] bg-elevated border border-strong rounded-2xl p-6 shadow-md flex flex-col justify-between cursor-pointer hover:border-lumora-accent transition-all group relative select-none"
          >
            {/* Tag / Concept Header */}
            <div className="flex items-center justify-between text-[10px] font-mono text-lumora-text-muted">
              <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-surface border border-subtle">
                {currentCard.keyConcept}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCitationClicked(currentCard.chunkId, currentCard.pageNumber);
                }}
                className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-lumora-citation/60 hover:bg-lumora-citation text-lumora-text-primary font-medium"
              >
                <IconCitation size={11} className="text-amber-700" />
                <span>Page {currentCard.pageNumber}</span>
              </button>
            </div>

            {/* Question / Answer Text */}
            <div className="py-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-lumora-accent mb-2">
                {isFlipped ? 'Answer & Mechanism' : 'Active Recall Question'}
              </p>
              <p className="text-sm md:text-base font-editorial text-lumora-text-primary leading-relaxed whitespace-pre-wrap">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            {/* Footer Flip Hint */}
            <div className="text-center text-[10px] text-lumora-text-muted font-mono">
              {isFlipped ? 'Click card or rate recall difficulty below' : 'Click card or press [Space] to flip'}
            </div>
          </div>

          {/* Rating Buttons */}
          {isFlipped && (
            <div className="grid grid-cols-4 gap-2 mt-4 animate-fade-in">
              <button
                onClick={() => handleRateCard(1)}
                className="p-2 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 text-center"
              >
                <span className="block font-bold">Again</span>
                <span className="text-[9px] font-mono opacity-70">[1] &lt;1m</span>
              </button>
              <button
                onClick={() => handleRateCard(2)}
                className="p-2 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-medium hover:bg-amber-500/20 text-center"
              >
                <span className="block font-bold">Hard</span>
                <span className="text-[9px] font-mono opacity-70">[2] 1d</span>
              </button>
              <button
                onClick={() => handleRateCard(3)}
                className="p-2 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 text-xs font-medium hover:bg-blue-500/20 text-center"
              >
                <span className="block font-bold">Good</span>
                <span className="text-[9px] font-mono opacity-70">[3] 3d</span>
              </button>
              <button
                onClick={() => handleRateCard(4)}
                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 text-center"
              >
                <span className="block font-bold">Easy</span>
                <span className="text-[9px] font-mono opacity-70">[4] 7d</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completion Celebration Screen */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-elevated rounded-2xl border border-subtle my-2 space-y-4 animate-scale-in">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <IconCheck size={28} />
          </div>
          <div>
            <h4 className="text-base font-semibold text-lumora-text-primary">Deck Completed!</h4>
            <p className="text-xs text-lumora-text-secondary mt-1">
              You reviewed {deck.length} active recall cards. Spaced repetition intervals have been updated.
            </p>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-subtle w-full max-w-xs text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-lumora-text-muted">Mastered Today:</span>
              <span className="text-emerald-600 font-bold">{masteredCount} cards</span>
            </div>
            <div className="flex justify-between">
              <span className="text-lumora-text-muted">Retention Score:</span>
              <span className="text-lumora-text-primary font-bold">
                {Math.round((masteredCount / deck.length) * 100)}%
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentIndex(0);
              setIsCompleted(false);
              setIsFlipped(false);
            }}
            className="py-2 px-6 rounded-lg bg-lumora-accent text-white text-xs font-medium hover:bg-lumora-accent-hover transition-colors shadow-xs"
          >
            Review Deck Again
          </button>
        </div>
      )}
    </div>
  );
};
