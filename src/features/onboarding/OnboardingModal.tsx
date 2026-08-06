'use client';

import React, { useState } from 'react';
import { useTheme } from '@/shared/theme/ThemeProvider';
import {
  IconLumoraLogo,
  IconBrainSummary,
  IconFlashcard,
  IconQuiz,
  IconCornellNotes,
  IconKey,
  IconSun,
  IconMoon,
  IconUpload,
  IconCheck,
  IconChevronRight,
  IconSparkles,
  IconX,
} from '@/shared/icons';
import { DocumentSource } from '@/shared/types';
import { createHandbookDocument } from '@/shared/lib/handbook-data';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHandbook: (doc: DocumentSource) => void;
  onOpenUpload: () => void;
  onStartTour: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSelectHandbook,
  onOpenUpload,
  onStartTour,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleFinishWithHandbook = () => {
    const handbookDoc = createHandbookDocument();
    onSelectHandbook(handbookDoc);
    onClose();
    onStartTour();
  };

  const handleFinishWithUpload = () => {
    onClose();
    onOpenUpload();
  };

  const handleFinishBlank = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-elevated border border-strong w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header & Step Indicator */}
        <div className="px-6 py-4 border-b border-subtle flex items-center justify-between bg-surface/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-lumora-accent flex items-center justify-center text-white shadow-sm">
              <IconLumoraLogo size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-lumora-text-primary">
                Lumora Onboarding Walkthrough
              </h2>
              <p className="text-[11px] text-lumora-text-muted">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Step Dots */}
            <div className="flex space-x-1.5 mr-3">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentStep === step
                      ? 'bg-lumora-accent w-5'
                      : step < currentStep
                      ? 'bg-lumora-accent/40'
                      : 'bg-subtle'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-lumora-text-muted hover:text-lumora-text-primary hover:bg-surface transition-colors"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Step Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: The Core Creed & 6-Stage Funnel */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-scale-in">
              <div className="text-center space-y-2 max-w-lg mx-auto">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-lumora-accent-subtle text-lumora-accent text-xs font-semibold">
                  <IconSparkles size={13} />
                  <span>The Learning Operating System</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-editorial text-lumora-text-primary">
                  Information is abundant. Understanding is scarce.
                </h3>
                <p className="text-xs md:text-sm text-lumora-text-secondary leading-relaxed font-editorial">
                  Lumora is not another chatbot or an AI wrapper. It is a distraction-free learning operating system designed to move your brain through a structured 6-stage comprehension pipeline.
                </p>
              </div>

              {/* The 6-Stage Pipeline Graphic */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-3 rounded-xl bg-surface border border-subtle space-y-1">
                  <span className="text-[10px] font-mono text-lumora-accent font-bold uppercase">1. Information</span>
                  <p className="text-xs font-semibold text-lumora-text-primary">Ingest & OCR</p>
                  <p className="text-[11px] text-lumora-text-muted">PDFs, DOCX, Markdown, OCR images & YouTube transcripts.</p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-subtle space-y-1">
                  <span className="text-[10px] font-mono text-lumora-accent font-bold uppercase">2. Understanding</span>
                  <p className="text-xs font-semibold text-lumora-text-primary">Deconstruct</p>
                  <p className="text-[11px] text-lumora-text-muted">ELI5 & Advanced explanations with verified inline citations.</p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-subtle space-y-1">
                  <span className="text-[10px] font-mono text-lumora-accent font-bold uppercase">3. Practice</span>
                  <p className="text-xs font-semibold text-lumora-text-primary">Active Retrieval</p>
                  <p className="text-[11px] text-lumora-text-muted">Automated flashcard generation & adaptive quizzes.</p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-subtle space-y-1">
                  <span className="text-[10px] font-mono text-lumora-accent font-bold uppercase">4. Retention</span>
                  <p className="text-xs font-semibold text-lumora-text-primary">Spaced Repetition</p>
                  <p className="text-[11px] text-lumora-text-muted">SuperMemo SM-2 memory scheduling for permanent recall.</p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-subtle space-y-1">
                  <span className="text-[10px] font-mono text-lumora-accent font-bold uppercase">5. Application</span>
                  <p className="text-xs font-semibold text-lumora-text-primary">Synthesis</p>
                  <p className="text-[11px] text-lumora-text-muted">Cornell notes, concept comparison matrices & timelines.</p>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-subtle space-y-1">
                  <span className="text-[10px] font-mono text-lumora-accent font-bold uppercase">6. Mastery</span>
                  <p className="text-xs font-semibold text-lumora-text-primary">Fluency</p>
                  <p className="text-[11px] text-lumora-text-muted">1-click pristine Markdown and Anki deck export.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Calibrated Aesthetics & Theme */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-scale-in">
              <div className="space-y-1 text-center">
                <h3 className="text-lg md:text-xl font-bold font-editorial text-lumora-text-primary">
                  Calm Aesthetics & Distraction-Free Design
                </h3>
                <p className="text-xs text-lumora-text-secondary">
                  Choose your reading theme. You can switch instantaneously at any time.
                </p>
              </div>

              {/* Theme Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    theme === 'light'
                      ? 'border-lumora-accent bg-amber-50/40 shadow-sm'
                      : 'border-subtle hover:border-strong bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IconSun size={18} className="text-amber-600" />
                      <span className="text-xs font-bold text-gray-900">Warm Light (Default)</span>
                    </div>
                    {theme === 'light' && <IconCheck size={16} className="text-lumora-accent" />}
                  </div>
                  <p className="text-[11px] text-gray-600 font-editorial leading-relaxed">
                    Alabaster paper canvas (`#FBF9F5`) and deep forest pine. Resembles warm sunlight on editorial print.
                  </p>
                </div>

                <div
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    theme === 'dark'
                      ? 'border-emerald-500 bg-neutral-900 shadow-sm'
                      : 'border-subtle hover:border-strong bg-surface'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IconMoon size={18} className="text-emerald-400" />
                      <span className="text-xs font-bold text-gray-100">Premium Dark</span>
                    </div>
                    {theme === 'dark' && <IconCheck size={16} className="text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-gray-400 font-editorial leading-relaxed">
                    Deep obsidian (`#121214`) and sage emerald. Formulated for zero eye strain during night research.
                  </p>
                </div>
              </div>

              {/* Keyboard Shortcuts Overview */}
              <div className="p-3.5 bg-surface border border-subtle rounded-xl space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-lumora-text-muted font-bold block">
                  Essential Desktop Shortcuts
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between bg-canvas px-2.5 py-1.5 rounded-lg border border-subtle">
                    <span className="text-lumora-text-secondary">Universal Search</span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-subtle">⌘K</kbd>
                  </div>
                  <div className="flex items-center justify-between bg-canvas px-2.5 py-1.5 rounded-lg border border-subtle">
                    <span className="text-lumora-text-secondary">Zen Focus Mode</span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-subtle">⌘⌥Z</kbd>
                  </div>
                  <div className="flex items-center justify-between bg-canvas px-2.5 py-1.5 rounded-lg border border-subtle">
                    <span className="text-lumora-text-secondary">Toggle Sidebar</span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-subtle">⌘\</kbd>
                  </div>
                  <div className="flex items-center justify-between bg-canvas px-2.5 py-1.5 rounded-lg border border-subtle">
                    <span className="text-lumora-text-secondary">Flip Flashcard</span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-subtle">Space</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Sovereign Privacy & BYOK AI */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-scale-in">
              <div className="space-y-1 text-center">
                <h3 className="text-lg md:text-xl font-bold font-editorial text-lumora-text-primary">
                  Sovereign Privacy & Local-First Intelligence
                </h3>
                <p className="text-xs text-lumora-text-secondary">
                  Your documents, study history, and API keys remain in your personal perimeter.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-surface border border-subtle">
                  <div className="p-2 rounded-lg bg-lumora-accent/10 text-lumora-accent flex-shrink-0 mt-0.5">
                    <IconKey size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-lumora-text-primary">
                      Bring Your Own Key (BYOK) AES-GCM Vault
                    </h4>
                    <p className="text-[11px] text-lumora-text-secondary font-editorial mt-0.5 leading-relaxed">
                      Connect your own API key for OpenRouter, Anthropic Claude, OpenAI, Gemini, Groq, Mistral, or DeepSeek. Keys are encrypted client-side using WebCrypto AES-GCM (256-bit).
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-surface border border-subtle">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 flex-shrink-0 mt-0.5">
                    <IconBrainSummary size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-lumora-text-primary">
                      Local Offline Ollama & Built-in Engine
                    </h4>
                    <p className="text-[11px] text-lumora-text-secondary font-editorial mt-0.5 leading-relaxed">
                      Run 100% offline with local Ollama (`http://localhost:11434`) or use Lumora's built-in pedagogical heuristic engine out of the box with zero external configuration.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-surface border border-subtle">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 flex-shrink-0 mt-0.5">
                    <IconCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-lumora-text-primary">
                      Zero-Wall Launch & Progressive Sync
                    </h4>
                    <p className="text-[11px] text-lumora-text-secondary font-editorial mt-0.5 leading-relaxed">
                      No mandatory sign-ups. Your browser sandbox stores everything locally, with optional cloud sync whenever you choose.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Choose How to Begin */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-scale-in">
              <div className="space-y-1 text-center">
                <h3 className="text-lg md:text-xl font-bold font-editorial text-lumora-text-primary">
                  Ready to Transform Information into Understanding
                </h3>
                <p className="text-xs text-lumora-text-secondary">
                  Choose how you would like to start your workspace session:
                </p>
              </div>

              <div className="space-y-3">
                {/* Option A: Lumora Handbook (Recommended) */}
                <div
                  onClick={handleFinishWithHandbook}
                  className="p-4 rounded-xl bg-lumora-accent-subtle border-2 border-lumora-accent hover:bg-lumora-accent-subtle/80 cursor-pointer transition-all flex items-center justify-between group shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-lumora-accent text-white flex items-center justify-center flex-shrink-0">
                      <IconSparkles size={18} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-lumora-text-primary">
                          Explore with the Lumora Handbook (Recommended)
                        </h4>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-lumora-accent text-white font-bold">
                          Interactive Tour
                        </span>
                      </div>
                      <p className="text-[11px] text-lumora-text-secondary font-editorial mt-0.5">
                        Loads the official User Handbook with ready-to-test flashcard decks, quizzes, Cornell notes, and citation highlights.
                      </p>
                    </div>
                  </div>
                  <IconChevronRight size={18} className="text-lumora-accent group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Option B: Upload Own Document */}
                <div
                  onClick={handleFinishWithUpload}
                  className="p-4 rounded-xl bg-surface border border-subtle hover:border-lumora-accent hover:bg-surface/80 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-canvas border border-subtle text-lumora-text-primary flex items-center justify-center flex-shrink-0">
                      <IconUpload size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-lumora-text-primary">
                        Upload Your Own Research Paper / Notes
                      </h4>
                      <p className="text-[11px] text-lumora-text-muted font-editorial mt-0.5">
                        Ingest your own PDF, DOCX, Markdown, lecture recording, or YouTube video transcript.
                      </p>
                    </div>
                  </div>
                  <IconChevronRight size={18} className="text-lumora-text-muted group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Option C: Start Blank */}
                <div
                  onClick={handleFinishBlank}
                  className="p-4 rounded-xl bg-surface border border-subtle hover:border-strong cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-canvas border border-subtle text-lumora-text-muted flex items-center justify-center flex-shrink-0">
                      <IconLumoraLogo size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-lumora-text-secondary">
                        Start with Clean Blank Workspace
                      </h4>
                      <p className="text-[11px] text-lumora-text-muted font-editorial mt-0.5">
                        Open empty canvas and paste notes or structure ideas from scratch.
                      </p>
                    </div>
                  </div>
                  <IconChevronRight size={18} className="text-lumora-text-muted group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 border-t border-subtle bg-surface flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="text-xs px-3 py-1.5 rounded-lg border border-subtle bg-canvas text-lumora-text-secondary hover:text-lumora-text-primary disabled:opacity-30 transition-colors"
          >
            ◀ Back
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 text-lumora-text-muted hover:text-lumora-text-primary"
            >
              Skip Walkthrough
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
                className="text-xs px-4 py-1.5 rounded-lg bg-lumora-accent text-white font-medium hover:bg-lumora-accent-hover flex items-center space-x-1 transition-colors shadow-xs"
              >
                <span>Continue</span>
                <IconChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishWithHandbook}
                className="text-xs px-4 py-1.5 rounded-lg bg-lumora-accent text-white font-medium hover:bg-lumora-accent-hover flex items-center space-x-1 transition-colors shadow-xs"
              >
                <IconCheck size={14} />
                <span>Enter Workspace</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
