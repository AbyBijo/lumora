'use client';

import React, { useState } from 'react';
import { DocumentSource, WorkspaceProject } from '@/shared/types';
import { useTheme } from '@/shared/theme/ThemeProvider';
import {
  IconLumoraLogo,
  IconDocument,
  IconUpload,
  IconSearch,
  IconSun,
  IconMoon,
  IconSettings,
  IconTrash,
  IconKey,
  IconSidebarLeft,
  IconSparkles,
} from '@/shared/icons';

interface SidebarProps {
  documents: DocumentSource[];
  activeDocId: string | null;
  onSelectDocument: (id: string) => void;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  onOpenOnboarding: () => void;
  onDeleteDocument: (id: string) => void;
  onToggleSidebar: () => void;
  isMobileOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  documents,
  activeDocId,
  onSelectDocument,
  onOpenUpload,
  onOpenSettings,
  onOpenOnboarding,
  onDeleteDocument,
  onToggleSidebar,
  isMobileOpen = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(documents.flatMap((d) => d.tags)));

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      doc.originalFileName.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesTag = selectedTag ? doc.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <aside
      className={`h-full w-64 md:w-72 flex-shrink-0 bg-surface border-r border-subtle flex flex-col justify-between select-none transition-all duration-200 ${
        isMobileOpen ? 'fixed inset-y-0 left-0 z-40 shadow-2xl flex' : 'hidden md:flex'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-14 px-4 border-b border-subtle flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-lumora-accent flex items-center justify-center text-white shadow-sm">
              <IconLumoraLogo size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-lumora-text-primary flex items-center space-x-1.5">
                <span>Lumora</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-lumora-accent-subtle text-lumora-accent font-semibold">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-lumora-text-muted">Learning Operating System</p>
            </div>
          </div>

          <button
            onClick={onToggleSidebar}
            title="Collapse Sidebar (Cmd+\)"
            className="hidden md:flex p-1.5 rounded-md text-lumora-text-muted hover:text-lumora-text-primary hover:bg-elevated transition-colors"
          >
            <IconSidebarLeft size={16} />
          </button>
        </div>

        {/* Action Button: Ingest New Source */}
        <div className="p-3">
          <button
            onClick={onOpenUpload}
            className="w-full py-2 px-3 rounded-lg bg-lumora-accent text-white text-xs font-medium flex items-center justify-center space-x-2 shadow-sm hover:bg-lumora-accent-hover active:scale-[0.98] transition-all"
          >
            <IconUpload size={14} />
            <span>Add Source Document</span>
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <IconSearch
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-lumora-text-muted"
            />
            <input
              type="text"
              placeholder="Search library..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md bg-canvas border border-subtle text-lumora-text-primary placeholder:text-lumora-text-muted focus:outline-none focus:border-lumora-accent"
            />
          </div>
        </div>

        {/* Tags Row */}
        {allTags.length > 0 && (
          <div className="px-3 pb-2 flex items-center space-x-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap transition-colors ${
                selectedTag === null
                  ? 'bg-lumora-accent text-white border-lumora-accent font-medium'
                  : 'bg-canvas text-lumora-text-secondary border-subtle hover:text-lumora-text-primary'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? 'bg-lumora-accent text-white border-lumora-accent font-medium'
                    : 'bg-canvas text-lumora-text-secondary border-subtle hover:text-lumora-text-primary'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Document Sources List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 py-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-lumora-text-muted px-2 py-1">
            Documents ({filteredDocs.length})
          </div>

          {filteredDocs.length === 0 ? (
            <div className="p-4 text-center text-xs text-lumora-text-muted">
              No matching documents. Click "Add Source Document" to ingest materials.
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isActive = doc.id === activeDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDocument(doc.id)}
                  className={`group relative flex items-start p-2 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? 'bg-elevated border border-strong shadow-sm text-lumora-text-primary font-medium'
                      : 'hover:bg-elevated/60 text-lumora-text-secondary hover:text-lumora-text-primary'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-md mr-2.5 flex-shrink-0 mt-0.5 ${
                      isActive
                        ? 'bg-lumora-accent text-white'
                        : 'bg-canvas border border-subtle text-lumora-text-muted group-hover:text-lumora-text-primary'
                    }`}
                  >
                    <IconDocument size={14} />
                  </div>

                  <div className="flex-1 min-w-0 pr-5">
                    <p className="text-xs truncate leading-snug">{doc.title}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-lumora-text-muted mt-0.5">
                      <span className="uppercase font-mono">{doc.format}</span>
                      <span>•</span>
                      <span>{doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}</span>
                      <span>•</span>
                      <span>{doc.chunks.length} chunks</span>
                    </div>
                  </div>

                  {/* Delete Document Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove "${doc.title}" from local workspace?`)) {
                        onDeleteDocument(doc.id);
                      }
                    }}
                    title="Delete document"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-lumora-text-muted hover:text-red-500 hover:bg-canvas transition-all absolute right-2 top-2"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="p-3 border-t border-subtle space-y-1.5 bg-surface">
        {/* Onboarding & System Tour */}
        <button
          onClick={onOpenOnboarding}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-lumora-text-secondary hover:text-lumora-text-primary hover:bg-elevated transition-colors"
        >
          <div className="flex items-center space-x-2">
            <IconSparkles size={14} className="text-amber-600" />
            <span>Onboarding & Guide</span>
          </div>
          <span className="text-[10px] font-mono text-lumora-text-muted">Tour</span>
        </button>

        {/* Settings & BYOK Keys */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-lumora-text-secondary hover:text-lumora-text-primary hover:bg-elevated transition-colors"
        >
          <div className="flex items-center space-x-2">
            <IconKey size={14} className="text-lumora-accent" />
            <span>AI Keys & Providers</span>
          </div>
          <span className="text-[10px] font-mono text-lumora-text-muted uppercase">BYOK</span>
        </button>

        {/* Theme Toggle (Warm Light / Premium Dark) */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-lumora-text-secondary hover:text-lumora-text-primary hover:bg-elevated transition-colors"
        >
          <div className="flex items-center space-x-2">
            {theme === 'light' ? <IconSun size={14} className="text-amber-600" /> : <IconMoon size={14} className="text-blue-400" />}
            <span>Theme: {theme === 'light' ? 'Warm Light' : 'Premium Dark'}</span>
          </div>
          <span className="text-[10px] text-lumora-text-muted font-mono">Switch</span>
        </button>
      </div>
    </aside>
  );
};
