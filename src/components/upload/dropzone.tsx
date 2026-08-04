'use client';

import * as React from 'react';
import { FileText, Globe, Link2, PenLine, UploadCloud, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { randomTip } from '@/engine/prompts';
import { uploadFile, uploadUrl, uploadPaste } from '@/lib/api/documents';

type Mode = 'file' | 'url' | 'paste';

export function Dropzone({ onUploaded }: { onUploaded: (documentId: string, title: string) => void }) {
  const [mode, setMode] = React.useState<Mode>('file');
  const [drag, setDrag] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [url, setUrl] = React.useState('');
  const [pasted, setPasted] = React.useState('');
  const [pastedTitle, setPastedTitle] = React.useState('');
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handle = async (fn: () => Promise<{ document: { id: string; title: string } }>) => {
    setBusy(true);
    setError(null);
    try {
      const { document } = await fn();
      onUploaded(document.id, document.title);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const submitFile = (file: File) => handle(() => uploadFile(file));

  const submitUrl = () => {
    if (!url.trim()) return;
    void handle(() => uploadUrl(url.trim()));
  };

  const submitPaste = () => {
    if (!pasted.trim()) return;
    void handle(() => uploadPaste(pasted, pastedTitle || undefined));
  };

  const [tip] = React.useState(() => randomTip());

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
        {(
          [
            { id: 'file' as Mode, label: 'Upload', icon: UploadCloud },
            { id: 'url' as Mode, label: 'Web URL', icon: Globe },
            { id: 'paste' as Mode, label: 'Paste notes', icon: PenLine },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors focus-ring',
              mode === t.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {mode === 'file' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f) submitFile(f);
          }}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all',
            drag
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-primary/40 hover:bg-card-2/50'
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) submitFile(f);
            }}
          />
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">
            {drag ? 'Drop it here' : 'Drag & drop a document'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse — PDF, DOCX, TXT, Markdown · up to 15 MB
          </p>
          <div className="mt-5 flex items-center gap-2">
            {['PDF', 'DOCX', 'TXT', 'MD'].map((f) => (
              <span key={f} className="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {mode === 'url' && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" /> Paste an article URL
          </label>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://en.wikipedia.org/wiki/Spaced_repetition"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitUrl()}
            />
            <Button onClick={submitUrl} loading={busy}>
              Fetch
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Lumora extracts the article&apos;s structure and headings for the curriculum.
          </p>
        </div>
      )}

      {mode === 'paste' && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <label className="mb-2 block text-xs font-medium text-muted-foreground">
            Paste your notes or text (Markdown headings supported)
          </label>
          <Input
            className="mb-2"
            placeholder="Title (optional)"
            value={pastedTitle}
            onChange={(e) => setPastedTitle(e.target.value)}
          />
          <Textarea
            rows={9}
            placeholder={'# My Topic\n\n## First section\n\nKey ideas here…\n\n## Second section\n\nMore content…'}
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <Button onClick={submitPaste} loading={busy}>
              <File className="h-4 w-4" />
              Build curriculum
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-xs text-danger">
          {error}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">💡 {tip}</p>
    </div>
  );
}
