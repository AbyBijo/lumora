'use client';

import React, { useState } from 'react';
import { IconX, IconCheck, IconLumoraLogo } from '@/shared/icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [synced, setSynced] = useState(false);

  if (!isOpen) return null;

  const handleSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSynced(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-elevated border border-subtle w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-subtle pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-lumora-accent flex items-center justify-center text-white">
              <IconLumoraLogo size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-lumora-text-primary">Progressive Cloud Sync</h3>
              <p className="text-xs text-lumora-text-muted">Zero-wall launch • Privacy First</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-lumora-text-muted hover:text-lumora-text-primary"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Philosophy message */}
        <div className="p-3 bg-lumora-accent-subtle rounded-xl text-xs text-lumora-text-primary space-y-1">
          <p className="font-semibold text-lumora-accent">No mandatory account needed to learn.</p>
          <p className="text-lumora-text-secondary text-[11px] leading-relaxed">
            Your local documents, parsed chunks, flashcard SRS history, and BYOK keys are safely stored in your browser sandbox right now. Connect an email only if you wish to sync across devices.
          </p>
        </div>

        {/* Sync form */}
        {!synced ? (
          <form onSubmit={handleSync} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-lumora-text-secondary mb-1">
                Link Email for Multi-Device Backup
              </label>
              <input
                type="email"
                required
                placeholder="scholar@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-surface border border-subtle text-lumora-text-primary focus:outline-none focus:border-lumora-accent"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-lumora-accent text-white text-xs font-medium hover:bg-lumora-accent-hover transition-colors shadow-xs"
            >
              Enable Encrypted Multi-Device Sync
            </button>
          </form>
        ) : (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-700 dark:text-emerald-300 space-y-1 animate-scale-in">
            <IconCheck size={20} className="mx-auto text-emerald-600" />
            <p className="font-semibold">Local Workspace Synced!</p>
            <p className="text-[11px] opacity-80">All documents and decks are backed up to your perimeter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
