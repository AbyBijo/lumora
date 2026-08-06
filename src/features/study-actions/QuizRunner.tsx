'use client';

import React, { useState } from 'react';
import { QuizDeck, DocumentSource } from '@/shared/types';
import { IconQuiz, IconCitation, IconCheck, IconX } from '@/shared/icons';
import confetti from 'canvas-confetti';

interface QuizRunnerProps {
  document: DocumentSource;
  quizDeck: QuizDeck;
  onCitationClicked: (chunkId: string, pageNumber: number) => void;
  onClose: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  document,
  quizDeck,
  onCitationClicked,
  onClose,
}) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const questions = quizDeck.questions;
  const currentQ = questions[currentQIndex];

  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId !== null) return; // Prevent changing after selection
    setSelectedOptionId(optionId);
    setAnswers((prev) => ({ ...prev, [currentQIndex]: optionId }));
  };

  const handleNext = () => {
    setSelectedOptionId(null);
    if (currentQIndex + 1 >= questions.length) {
      setIsFinished(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    } else {
      setCurrentQIndex((i) => i + 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const selected = answers[idx];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (selected && correctOption && selected === correctOption.id) {
        correct++;
      }
    });
    return correct;
  };

  const score = calculateScore();

  return (
    <div className="h-full flex flex-col bg-surface p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-subtle">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <IconQuiz size={16} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-lumora-text-primary">{quizDeck.title}</h3>
            <p className="text-[10px] text-lumora-text-muted">Adaptive Verification Quiz</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-lumora-text-muted hover:text-lumora-text-primary hover:bg-elevated"
        >
          <IconX size={16} />
        </button>
      </div>

      {!isFinished && currentQ ? (
        <div className="flex-1 flex flex-col justify-between py-3 space-y-4">
          {/* Question Meta & Progress */}
          <div>
            <div className="flex justify-between items-center text-[11px] font-mono text-lumora-text-muted mb-2">
              <span>Question {currentQIndex + 1} of {questions.length}</span>
              <span className="uppercase px-2 py-0.5 rounded bg-canvas border border-subtle">
                {currentQ.difficulty}
              </span>
            </div>

            {/* Question Text */}
            <div className="bg-elevated border border-strong rounded-xl p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-lumora-accent mb-1">
                Concept: {currentQ.conceptTested}
              </p>
              <h4 className="text-sm md:text-base font-medium text-lumora-text-primary leading-snug">
                {currentQ.questionText}
              </h4>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {currentQ.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const hasAnswered = selectedOptionId !== null;

              let optionStyle = 'bg-elevated border-subtle hover:border-lumora-accent text-lumora-text-primary';
              if (hasAnswered) {
                if (option.isCorrect) {
                  optionStyle = 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-medium';
                } else if (isSelected && !option.isCorrect) {
                  optionStyle = 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-300';
                } else {
                  optionStyle = 'bg-elevated/40 border-subtle opacity-50 text-lumora-text-muted';
                }
              }

              return (
                <div
                  key={option.id}
                  onClick={() => !hasAnswered && handleSelectOption(option.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center font-mono text-xs font-bold border border-current">
                      {option.id}
                    </span>
                    <div className="flex-1 text-xs md:text-sm">
                      <p>{option.text}</p>
                      {hasAnswered && (isSelected || option.isCorrect) && (
                        <p className="text-[11px] mt-1.5 pt-1.5 border-t border-current/20 font-sans opacity-90">
                          {option.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Navigation & Citation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onCitationClicked(currentQ.chunkId, currentQ.pageNumber)}
              className="flex items-center space-x-1 text-xs text-lumora-text-secondary hover:text-lumora-accent"
            >
              <IconCitation size={13} className="text-amber-600" />
              <span>Verify on Page {currentQ.pageNumber}</span>
            </button>

            {selectedOptionId !== null && (
              <button
                onClick={handleNext}
                className="py-1.5 px-4 rounded-lg bg-lumora-accent text-white text-xs font-medium hover:bg-lumora-accent-hover transition-all animate-fade-in"
              >
                {currentQIndex + 1 >= questions.length ? 'See Results' : 'Next Question ▶'}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Finished Score Card */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-elevated rounded-2xl border border-subtle my-2 space-y-4 animate-scale-in">
          <div className="w-14 h-14 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <IconQuiz size={28} />
          </div>
          <div>
            <h4 className="text-base font-semibold text-lumora-text-primary">Quiz Complete!</h4>
            <p className="text-xs text-lumora-text-secondary mt-1">
              You scored {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%).
            </p>
          </div>

          <div className="p-3 bg-surface rounded-xl border border-subtle w-full max-w-xs text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-lumora-text-muted">Mastery Status:</span>
              <span className="text-purple-600 font-bold">
                {score === questions.length ? 'Mastered (100%)' : score >= 2 ? 'Competent' : 'Needs Review'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentQIndex(0);
              setSelectedOptionId(null);
              setAnswers({});
              setIsFinished(false);
            }}
            className="py-2 px-6 rounded-lg bg-lumora-accent text-white text-xs font-medium hover:bg-lumora-accent-hover transition-colors shadow-xs"
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};
