'use client';

import * as React from 'react';
import { Dropzone } from '@/components/upload/dropzone';
import { Pipeline } from '@/components/upload/pipeline';
import { ShieldCheck } from 'lucide-react';

export default function UploadPage() {
  const [processing, setProcessing] = React.useState<{ id: string; title: string } | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Build a learning path</h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
          Upload a document — Lumora turns it into modules, lessons, quizzes, and
          flashcards. Every claim stays traceable to the source.
        </p>
      </div>

      {processing ? (
        <Pipeline documentId={processing.id} title={processing.title} />
      ) : (
        <>
          <div className="mx-auto max-w-2xl">
            <Dropzone
              onUploaded={(id, title) => setProcessing({ id, title })}
            />
          </div>
          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
            {[
              'Local engine by default — no API key needed',
              'Optional: OpenAI / Anthropic keys upgrade generation quality',
              'Your source stays on your machine',
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                {t}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
