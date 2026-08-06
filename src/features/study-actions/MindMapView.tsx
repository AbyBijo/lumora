'use client';

import React, { useState } from 'react';
import { MindMapNode, DocumentSource } from '@/shared/types';
import { IconMindMap, IconChevronRight, IconChevronDown, IconCitation, IconX } from '@/shared/icons';

interface MindMapViewProps {
  document: DocumentSource;
  rootNode: MindMapNode;
  onCitationClicked: (chunkId: string, pageNumber: number) => void;
  onClose: () => void;
}

export const MindMapView: React.FC<MindMapViewProps> = ({
  document,
  rootNode,
  onCitationClicked,
  onClose,
}) => {
  return (
    <div className="h-full flex flex-col bg-surface p-4 overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-subtle">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
            <IconMindMap size={16} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-lumora-text-primary">Knowledge Graph & Concept Map</h3>
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

      {/* Interactive Recursive Node Tree */}
      <div className="bg-elevated border border-subtle rounded-xl p-4 shadow-xs space-y-3">
        <div className="p-2.5 rounded-lg bg-lumora-accent text-white font-medium text-xs md:text-sm flex items-center justify-between shadow-xs">
          <span>{rootNode.label}</span>
          {rootNode.pageNumber && (
            <button
              onClick={() => onCitationClicked(document.chunks[0]?.id || 'chk', rootNode.pageNumber!)}
              className="text-[10px] px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white font-mono"
            >
              Page {rootNode.pageNumber}
            </button>
          )}
        </div>

        <div className="pl-4 border-l-2 border-subtle space-y-3">
          {rootNode.children?.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              document={document}
              onCitationClicked={onCitationClicked}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const TreeNodeItem: React.FC<{
  node: MindMapNode;
  document: DocumentSource;
  onCitationClicked: (chunkId: string, pageNumber: number) => void;
}> = ({ node, document, onCitationClicked }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2 bg-surface/60 p-2.5 rounded-lg border border-subtle">
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 rounded hover:bg-canvas text-lumora-text-muted mt-0.5"
          >
            {expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          </button>
        ) : (
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-500/20 text-cyan-600 flex items-center justify-center text-[9px] font-bold mt-0.5">
            •
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-lumora-text-primary">
              {node.label}
            </span>
            {node.pageNumber && (
              <button
                onClick={() => onCitationClicked(document.chunks[0]?.id || 'chk', node.pageNumber!)}
                className="flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded bg-lumora-citation/60 hover:bg-lumora-citation text-lumora-text-primary font-mono"
              >
                <IconCitation size={10} className="text-amber-700" />
                <span>p.{node.pageNumber}</span>
              </button>
            )}
          </div>
          {node.description && (
            <p className="text-[11px] font-editorial text-lumora-text-secondary mt-0.5">
              {node.description}
            </p>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="pl-4 border-l-2 border-subtle space-y-2">
          {node.children!.map((c) => (
            <TreeNodeItem
              key={c.id}
              node={c}
              document={document}
              onCitationClicked={onCitationClicked}
            />
          ))}
        </div>
      )}
    </div>
  );
};
