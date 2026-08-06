'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentSource,
  StudyActionType,
  AIProviderConfig,
  Flashcard,
  QuizDeck,
  SummaryData,
  CornellNotesData,
  ConceptComparisonData,
  TimelineEvent,
  MindMapNode,
} from '@/shared/types';
import {
  createHandbookDocument,
  getHandbookFlashcards,
  getHandbookQuiz,
  getHandbookSummary,
  getHandbookCornellNotes,
  getHandbookConceptComparison,
  getHandbookTimeline,
  getHandbookMindMap,
} from '@/shared/lib/handbook-data';
import { Sidebar } from '@/features/workspace/Sidebar';
import { DocumentViewer } from '@/features/document-viewer/DocumentViewer';
import { AIStudio } from '@/features/ai-studio/AIStudio';
import { FlashcardRunner } from '@/features/study-actions/FlashcardRunner';
import { QuizRunner } from '@/features/study-actions/QuizRunner';
import { SummaryView } from '@/features/study-actions/SummaryView';
import { CornellNotesView } from '@/features/study-actions/CornellNotesView';
import { ConceptComparisonView } from '@/features/study-actions/ConceptComparisonView';
import { TimelineView } from '@/features/study-actions/TimelineView';
import { MindMapView } from '@/features/study-actions/MindMapView';
import { UploadModal } from '@/features/workspace/UploadModal';
import { SettingsModal } from '@/features/byok-vault/SettingsModal';
import { CommandPalette } from '@/features/command-palette/CommandPalette';
import { ExportModal } from '@/features/export-engine/ExportModal';
import { AuthModal } from '@/features/auth-modal/AuthModal';
import { OnboardingModal } from '@/features/onboarding/OnboardingModal';
import { SpotlightTour } from '@/features/onboarding/SpotlightTour';
import {
  IconSidebarLeft,
  IconSidebarRight,
  IconZen,
  IconSearch,
  IconExport,
  IconBrainSummary,
  IconFlashcard,
  IconQuiz,
  IconCornellNotes,
  IconSparkles,
} from '@/shared/icons';

export default function LumoraWorkspacePage() {
  const [documents, setDocuments] = useState<DocumentSource[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [targetCitationChunkId, setTargetCitationChunkId] = useState<string | null>(null);

  // Panel collapse states
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);

  // Active study action in Right Panel
  const [activeStudyAction, setActiveStudyAction] = useState<StudyActionType | null>('flashcards');

  // Text selection trigger passed to AI Studio
  const [selectionTrigger, setSelectionTrigger] = useState<{ action: StudyActionType; text: string } | null>(null);

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Active BYOK Config
  const [activeProvider, setActiveProvider] = useState<AIProviderConfig | null>(null);

  // Initialize Documents from LocalStorage or Handbook Guide
  useEffect(() => {
    const savedDocs = localStorage.getItem('lumora_workspace_documents');
    const hasSeenOnboarding = localStorage.getItem('lumora_has_seen_onboarding_v1');

    if (savedDocs) {
      try {
        const parsed = JSON.parse(savedDocs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDocuments(parsed);
          setActiveDocId(parsed[0].id);
          if (!hasSeenOnboarding) {
            setIsOnboardingOpen(true);
          }
          return;
        }
      } catch (err) {
        console.warn('Failed parsing saved workspace documents:', err);
      }
    }

    // Default clean handbook guide
    const initialDoc = createHandbookDocument();
    setDocuments([initialDoc]);
    setActiveDocId(initialDoc.id);
    localStorage.setItem('lumora_workspace_documents', JSON.stringify([initialDoc]));

    if (!hasSeenOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Save documents to local storage on changes
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('lumora_workspace_documents', JSON.stringify(documents));
    }
  }, [documents]);

  // Load saved active BYOK provider config
  useEffect(() => {
    const savedProvider = localStorage.getItem('lumora_byok_provider_config');
    if (savedProvider) {
      try {
        setActiveProvider(JSON.parse(savedProvider));
      } catch {}
    }
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      // Cmd+\: Toggle Left Sidebar
      else if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === '\\') {
        e.preventDefault();
        setIsLeftOpen((prev) => !prev);
      }
      // Cmd+Shift+\: Toggle Right Panel
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '|') {
        e.preventDefault();
        setIsRightOpen((prev) => !prev);
      }
      // Cmd+Option+Z: Toggle Zen Focus Mode
      else if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        toggleZenMode();
      }
      // Cmd+Shift+F: Open Flashcards
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setActiveStudyAction('flashcards');
        setIsRightOpen(true);
      }
      // Cmd+Shift+Q: Open Quiz
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        setActiveStudyAction('quiz');
        setIsRightOpen(true);
      }
      // Cmd+Shift+S: Open Summary
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setActiveStudyAction('summarize');
        setIsRightOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  const toggleZenMode = () => {
    if (isZenMode) {
      setIsZenMode(false);
      setIsLeftOpen(true);
      setIsRightOpen(true);
    } else {
      setIsZenMode(true);
      setIsLeftOpen(false);
      setIsRightOpen(false);
    }
  };

  const handleDocumentAdded = (newDoc: DocumentSource) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    if (activeDocId === id) {
      setActiveDocId(updated[0]?.id || null);
    }
  };

  const handleSaveProvider = (provider: AIProviderConfig) => {
    setActiveProvider(provider);
    localStorage.setItem('lumora_byok_provider_config', JSON.stringify(provider));
  };

  const handleCitationClicked = (chunkId: string, pageNumber: number) => {
    setTargetCitationChunkId(chunkId);
  };

  const handleTextActionTriggered = (
    action: 'explain_eli5' | 'explain_advanced' | 'flashcard' | 'cornell_notes',
    selectedText: string
  ) => {
    if (action === 'flashcard') {
      setActiveStudyAction('flashcards');
      setIsRightOpen(true);
    } else if (action === 'cornell_notes') {
      setActiveStudyAction('cornell_notes');
      setIsRightOpen(true);
    } else {
      setSelectionTrigger({ action, text: selectedText });
    }
  };

  const activeDoc = documents.find((d) => d.id === activeDocId) || null;

  // Handbook Datasets
  const currentFlashcards: Flashcard[] = activeDoc ? getHandbookFlashcards(activeDoc.id) : [];
  const currentQuiz: QuizDeck | null = activeDoc ? getHandbookQuiz(activeDoc.id) : null;
  const currentSummary: SummaryData | null = activeDoc ? getHandbookSummary(activeDoc.id) : null;
  const currentCornellNotes: CornellNotesData | null = activeDoc ? getHandbookCornellNotes(activeDoc.id) : null;
  const currentConceptComparison: ConceptComparisonData | null = activeDoc
    ? getHandbookConceptComparison(activeDoc.id)
    : null;
  const currentTimeline: TimelineEvent[] = activeDoc ? getHandbookTimeline(activeDoc.id) : [];
  const currentMindMap: MindMapNode | null = activeDoc ? getHandbookMindMap(activeDoc.id) : null;

  return (
    <div className="flex h-screen w-screen bg-canvas overflow-hidden select-none">
      {/* 1. Left Sidebar: Workspace & Document Library */}
      {isLeftOpen && !isZenMode && (
        <Sidebar
          documents={documents}
          activeDocId={activeDocId}
          onSelectDocument={(id) => setActiveDocId(id)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onDeleteDocument={handleDeleteDocument}
          onToggleSidebar={() => setIsLeftOpen(false)}
        />
      )}

      {/* 2. Center & Right Main Working Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Universal Top Workspace Bar */}
        <header className="h-12 px-4 bg-surface border-b border-subtle flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center space-x-2">
            {!isLeftOpen && (
              <button
                onClick={() => setIsLeftOpen(true)}
                title="Expand Sidebar (Cmd+\)"
                className="p-1.5 rounded-md text-lumora-text-muted hover:text-lumora-text-primary hover:bg-elevated transition-colors"
              >
                <IconSidebarLeft size={16} />
              </button>
            )}

            {/* Document Title Breadcrumb */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-lumora-text-muted font-medium">Workspace</span>
              <span className="text-lumora-text-muted">/</span>
              <span className="font-semibold text-lumora-text-primary truncate max-w-xs md:max-w-sm">
                {activeDoc?.title || 'No Document Selected'}
              </span>
            </div>
          </div>

          {/* Quick Study Action Badges */}
          <div className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => {
                setActiveStudyAction('flashcards');
                setIsRightOpen(true);
              }}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                activeStudyAction === 'flashcards' && isRightOpen
                  ? 'bg-emerald-500/10 text-emerald-600 font-semibold'
                  : 'text-lumora-text-secondary hover:text-lumora-text-primary'
              }`}
            >
              <IconFlashcard size={13} />
              <span>Flashcards</span>
            </button>
            <button
              onClick={() => {
                setActiveStudyAction('quiz');
                setIsRightOpen(true);
              }}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                activeStudyAction === 'quiz' && isRightOpen
                  ? 'bg-purple-500/10 text-purple-600 font-semibold'
                  : 'text-lumora-text-secondary hover:text-lumora-text-primary'
              }`}
            >
              <IconQuiz size={13} />
              <span>Quiz</span>
            </button>
            <button
              onClick={() => {
                setActiveStudyAction('summarize');
                setIsRightOpen(true);
              }}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                activeStudyAction === 'summarize' && isRightOpen
                  ? 'bg-lumora-accent-subtle text-lumora-accent font-semibold'
                  : 'text-lumora-text-secondary hover:text-lumora-text-primary'
              }`}
            >
              <IconBrainSummary size={13} />
              <span>Summary</span>
            </button>
            <button
              onClick={() => {
                setActiveStudyAction('cornell_notes');
                setIsRightOpen(true);
              }}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                activeStudyAction === 'cornell_notes' && isRightOpen
                  ? 'bg-indigo-500/10 text-indigo-600 font-semibold'
                  : 'text-lumora-text-secondary hover:text-lumora-text-primary'
              }`}
            >
              <IconCornellNotes size={13} />
              <span>Cornell</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            {/* Tour & Guide button */}
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="hidden md:flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium hover:bg-amber-500/20 transition-colors"
            >
              <IconSparkles size={13} />
              <span>Tour & Guide</span>
            </button>

            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-canvas border border-subtle text-xs text-lumora-text-muted hover:text-lumora-text-primary hover:border-strong transition-all shadow-xs"
            >
              <IconSearch size={13} />
              <span className="hidden sm:inline">Search / Actions</span>
              <kbd className="text-[10px] font-mono px-1 py-0.5 rounded bg-surface border border-subtle">
                ⌘K
              </kbd>
            </button>

            {/* Export Guide */}
            <button
              onClick={() => setIsExportOpen(true)}
              title="Export Study Guide (Markdown/JSON)"
              className="p-1.5 rounded-md text-lumora-text-secondary hover:text-lumora-text-primary hover:bg-elevated transition-colors"
            >
              <IconExport size={16} />
            </button>

            {/* Zen Mode */}
            <button
              onClick={toggleZenMode}
              title="Toggle Zen Focus Mode (Cmd+Opt+Z)"
              className={`p-1.5 rounded-md transition-colors ${
                isZenMode
                  ? 'bg-lumora-accent text-white'
                  : 'text-lumora-text-secondary hover:text-lumora-text-primary hover:bg-elevated'
              }`}
            >
              <IconZen size={16} />
            </button>

            {/* Progressive Auth / Cloud Sync */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="hidden sm:flex text-xs px-2.5 py-1 rounded-md bg-lumora-accent-subtle text-lumora-accent font-medium hover:bg-lumora-accent hover:text-white transition-colors"
            >
              Sync
            </button>

            {/* Right Panel Toggle */}
            {!isZenMode && (
              <button
                onClick={() => setIsRightOpen((r) => !r)}
                title="Toggle Study Inspector (Cmd+Shift+\)"
                className={`p-1.5 rounded-md transition-colors ${
                  isRightOpen
                    ? 'text-lumora-text-primary bg-elevated border border-subtle'
                    : 'text-lumora-text-muted hover:text-lumora-text-primary hover:bg-elevated'
                }`}
              >
                <IconSidebarRight size={16} />
              </button>
            )}
          </div>
        </header>

        {/* Center Canvas + AI Studio Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Document & Reasoning Workspace */}
          <main className="flex-1 flex flex-col min-w-0 h-full">
            {/* Top 55%: Virtualized Document Viewer */}
            <div className="flex-1 min-h-0 border-b border-subtle">
              <DocumentViewer
                document={activeDoc}
                targetCitationChunkId={targetCitationChunkId}
                onTextActionTriggered={handleTextActionTriggered}
              />
            </div>

            {/* Bottom 45%: Grounded AI Reasoning Studio */}
            <div className="h-64 md:h-72 flex-shrink-0">
              <AIStudio
                document={activeDoc}
                activeProvider={activeProvider}
                onCitationClicked={handleCitationClicked}
                onOpenStudyActionRunner={(action) => {
                  setActiveStudyAction(action);
                  setIsRightOpen(true);
                }}
                externalPromptTrigger={selectionTrigger}
              />
            </div>
          </main>

          {/* 3. Right Inspector & Study Action Panel */}
          {isRightOpen && !isZenMode && activeDoc && (
            <aside className="w-80 md:w-96 flex-shrink-0 border-l border-subtle bg-surface h-full overflow-hidden flex flex-col animate-fade-in">
              {activeStudyAction === 'flashcards' && (
                <FlashcardRunner
                  document={activeDoc}
                  flashcards={currentFlashcards}
                  onCitationClicked={handleCitationClicked}
                  onClose={() => setIsRightOpen(false)}
                />
              )}

              {activeStudyAction === 'quiz' && currentQuiz && (
                <QuizRunner
                  document={activeDoc}
                  quizDeck={currentQuiz}
                  onCitationClicked={handleCitationClicked}
                  onClose={() => setIsRightOpen(false)}
                />
              )}

              {activeStudyAction === 'summarize' && currentSummary && (
                <SummaryView
                  document={activeDoc}
                  summaryData={currentSummary}
                  onCitationClicked={handleCitationClicked}
                  onClose={() => setIsRightOpen(false)}
                />
              )}

              {activeStudyAction === 'cornell_notes' && currentCornellNotes && (
                <CornellNotesView
                  document={activeDoc}
                  notesData={currentCornellNotes}
                  onCitationClicked={handleCitationClicked}
                  onClose={() => setIsRightOpen(false)}
                />
              )}

              {activeStudyAction === 'compare_concepts' && currentConceptComparison && (
                <ConceptComparisonView
                  document={activeDoc}
                  comparisonData={currentConceptComparison}
                  onClose={() => setIsRightOpen(false)}
                />
              )}

              {activeStudyAction === 'timeline' && (
                <TimelineView
                  document={activeDoc}
                  events={currentTimeline}
                  onCitationClicked={handleCitationClicked}
                  onClose={() => setIsRightOpen(false)}
                />
              )}

              {activeStudyAction === 'mind_map' && currentMindMap && (
                <MindMapView
                  document={activeDoc}
                  rootNode={currentMindMap}
                  onCitationClicked={handleCitationClicked}
                  onClose={() => setIsRightOpen(false)}
                />
              )}
            </aside>
          )}
        </div>
      </div>

      {/* Global Modals & Onboarding Tour */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          localStorage.setItem('lumora_has_seen_onboarding_v1', 'true');
        }}
        onSelectHandbook={(doc) => {
          setDocuments([doc]);
          setActiveDocId(doc.id);
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onStartTour={() => setIsTourActive(true)}
      />

      <SpotlightTour
        isActive={isTourActive}
        onComplete={() => setIsTourActive(false)}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentAdded={handleDocumentAdded}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeProvider={activeProvider}
        onSaveProvider={handleSaveProvider}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        documents={documents}
        onSelectDocument={(id) => setActiveDocId(id)}
        onTriggerStudyAction={(action) => {
          setActiveStudyAction(action);
          setIsRightOpen(true);
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        document={activeDoc}
        flashcards={currentFlashcards}
        quizDeck={currentQuiz}
        summaryData={currentSummary}
        cornellNotes={currentCornellNotes}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}
