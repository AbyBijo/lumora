'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DocumentSource, ChatMessage, CitationRef, StudyActionType, AIProviderConfig } from '@/shared/types';
import { executePedagogicalQuery } from '@/shared/lib/pedagogical-engine';
import {
  IconLumoraLogo,
  IconSend,
  IconSparkles,
  IconBrainSummary,
  IconExplain,
  IconFlashcard,
  IconQuiz,
  IconCornellNotes,
  IconCompare,
  IconTimeline,
  IconMindMap,
  IconCitation,
} from '@/shared/icons';

interface AIStudioProps {
  document: DocumentSource | null;
  activeProvider: AIProviderConfig | null;
  onCitationClicked: (chunkId: string, pageNumber: number) => void;
  onOpenStudyActionRunner: (action: StudyActionType) => void;
  externalPromptTrigger?: { action: StudyActionType; text: string } | null;
}

export const AIStudio: React.FC<AIStudioProps> = ({
  document,
  activeProvider,
  onCitationClicked,
  onOpenStudyActionRunner,
  externalPromptTrigger,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcoming message for new document
  useEffect(() => {
    if (document) {
      setMessages([
        {
          id: `msg_init_${document.id}`,
          role: 'assistant',
          content: `Welcome to **Lumora's Pedagogical Workspace** for **"${document.title}"**.\n\nEvery insight generated here is directly grounded in your source document with verified inline citations. Use the Study Action shortcuts below or ask any deep conceptual question.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [document?.id]);

  // Handle external text selection action trigger
  useEffect(() => {
    if (externalPromptTrigger && document) {
      handleSendQuery(
        `Please analyze this excerpt: "${externalPromptTrigger.text}"`,
        externalPromptTrigger.action
      );
    }
  }, [externalPromptTrigger]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendQuery = async (queryText?: string, studyAction?: StudyActionType) => {
    const query = queryText || inputQuery;
    if (!query.trim() || !document || isLoading) return;

    setInputQuery('');
    const userMsgId = `msg_user_${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: query,
        timestamp: new Date().toISOString(),
        studyActionType: studyAction,
      },
    ];

    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await executePedagogicalQuery(
        query,
        document,
        activeProvider,
        studyAction
      );

      setMessages([
        ...newMessages,
        {
          id: `msg_asst_${Date.now()}`,
          role: 'assistant',
          content: response.content,
          citations: response.citations,
          timestamp: new Date().toISOString(),
          studyActionType: studyAction,
        },
      ]);
    } catch (err) {
      console.error('Pedagogical query error:', err);
      setMessages([
        ...newMessages,
        {
          id: `msg_asst_err_${Date.now()}`,
          role: 'assistant',
          content: 'An error occurred while generating grounded response. Please verify your connection or BYOK API key.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render text containing citation tags like [ref:chk_123:p2]
  const renderMessageContent = (content: string, citations?: CitationRef[]) => {
    const parts = content.split(/(\[ref:[a-zA-Z0-9_-]+:p\d+\])/g);

    return (
      <div className="space-y-2 text-xs md:text-sm leading-relaxed">
        {parts.map((part, i) => {
          const match = part.match(/\[ref:([a-zA-Z0-9_-]+):p(\d+)\]/);
          if (match && match[1] && match[2]) {
            const chunkId = match[1];
            const pageNum = parseInt(match[2], 10);
            return (
              <button
                key={i}
                onClick={() => onCitationClicked(chunkId, pageNum)}
                className="inline-flex items-center space-x-1 px-1.5 py-0.5 mx-1 rounded bg-lumora-citation/60 border border-lumora-citation hover:bg-lumora-citation text-lumora-text-primary text-[11px] font-mono transition-all align-middle cursor-pointer"
                title={`Jump to Page ${pageNum} in Document Viewer`}
              >
                <IconCitation size={11} className="text-amber-700" />
                <span>p.{pageNum}</span>
              </button>
            );
          }
          return <span key={i} className="whitespace-pre-wrap">{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-surface/50 border-t border-subtle">
      {/* Study Action Accelerator Bar */}
      <div className="p-2 border-b border-subtle bg-surface flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            onOpenStudyActionRunner('summarize');
            handleSendQuery('Provide an executive summary and chapter-by-chapter breakdown of this document.', 'summarize');
          }}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-canvas border border-subtle hover:border-lumora-accent text-xs font-medium text-lumora-text-secondary hover:text-lumora-text-primary whitespace-nowrap transition-all shadow-xs"
        >
          <IconBrainSummary size={13} className="text-lumora-accent" />
          <span>Summarize</span>
        </button>

        <button
          onClick={() => {
            onOpenStudyActionRunner('explain_eli5');
            handleSendQuery('Explain the core intuition and mechanism of this document like I am five years old using analogies.', 'explain_eli5');
          }}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-canvas border border-subtle hover:border-lumora-accent text-xs font-medium text-lumora-text-secondary hover:text-lumora-text-primary whitespace-nowrap transition-all shadow-xs"
        >
          <IconExplain size={13} className="text-amber-600" />
          <span>Explain (ELI5)</span>
        </button>

        <button
          onClick={() => {
            onOpenStudyActionRunner('explain_advanced');
            handleSendQuery('Provide a rigorous, advanced mathematical and architectural breakdown of this document.', 'explain_advanced');
          }}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-canvas border border-subtle hover:border-lumora-accent text-xs font-medium text-lumora-text-secondary hover:text-lumora-text-primary whitespace-nowrap transition-all shadow-xs"
        >
          <IconSparkles size={13} className="text-blue-600" />
          <span>Advanced</span>
        </button>

        <button
          onClick={() => onOpenStudyActionRunner('flashcards')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-canvas border border-subtle hover:border-lumora-accent text-xs font-medium text-lumora-text-secondary hover:text-lumora-text-primary whitespace-nowrap transition-all shadow-xs"
        >
          <IconFlashcard size={13} className="text-emerald-600" />
          <span>Flashcards</span>
        </button>

        <button
          onClick={() => onOpenStudyActionRunner('quiz')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-canvas border border-subtle hover:border-lumora-accent text-xs font-medium text-lumora-text-secondary hover:text-lumora-text-primary whitespace-nowrap transition-all shadow-xs"
        >
          <IconQuiz size={13} className="text-purple-600" />
          <span>Quiz</span>
        </button>

        <button
          onClick={() => onOpenStudyActionRunner('cornell_notes')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-canvas border border-subtle hover:border-lumora-accent text-xs font-medium text-lumora-text-secondary hover:text-lumora-text-primary whitespace-nowrap transition-all shadow-xs"
        >
          <IconCornellNotes size={13} className="text-indigo-600" />
          <span>Cornell Notes</span>
        </button>

        <button
          onClick={() => onOpenStudyActionRunner('compare_concepts')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-canvas border border-subtle hover:border-lumora-accent text-xs font-medium text-lumora-text-secondary hover:text-lumora-text-primary whitespace-nowrap transition-all shadow-xs"
        >
          <IconCompare size={13} className="text-teal-600" />
          <span>Compare</span>
        </button>

        <button
          onClick={() => onOpenStudyActionRunner('timeline')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-canvas border border-subtle hover:border-lumora-accent text-xs font-medium text-lumora-text-secondary hover:text-lumora-text-primary whitespace-nowrap transition-all shadow-xs"
        >
          <IconTimeline size={13} className="text-rose-600" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => onOpenStudyActionRunner('mind_map')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-canvas border border-subtle hover:border-lumora-accent text-xs font-medium text-lumora-text-secondary hover:text-lumora-text-primary whitespace-nowrap transition-all shadow-xs"
        >
          <IconMindMap size={13} className="text-cyan-600" />
          <span>Mind Map</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-xl p-3.5 shadow-xs ${
                msg.role === 'user'
                  ? 'bg-lumora-accent text-white rounded-br-none'
                  : 'bg-elevated border border-subtle text-lumora-text-primary rounded-bl-none'
              }`}
            >
              {renderMessageContent(msg.content, msg.citations)}
            </div>
            <span className="text-[10px] text-lumora-text-muted mt-1 px-1 font-mono">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 p-3 bg-elevated border border-subtle rounded-xl text-xs text-lumora-text-secondary w-fit animate-pulse">
            <div className="w-2 h-2 rounded-full bg-lumora-accent animate-ping" />
            <span>Reasoning across document chunks & citations...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 bg-surface border-t border-subtle">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center space-x-2 bg-canvas border border-strong rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-lumora-accent shadow-xs"
        >
          <input
            type="text"
            placeholder={
              document
                ? `Ask anything about "${document.title}" (Cmd+Enter)...`
                : 'Select a document to begin...'
            }
            disabled={!document || isLoading}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 text-xs md:text-sm px-3 py-1.5 bg-transparent text-lumora-text-primary placeholder:text-lumora-text-muted focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || !document || isLoading}
            className="p-2 rounded-lg bg-lumora-accent text-white hover:bg-lumora-accent-hover disabled:opacity-40 transition-all shadow-xs"
          >
            <IconSend size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
