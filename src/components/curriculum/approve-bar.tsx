'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { getCurriculum, patchCurriculum } from '@/lib/api/curricula';

export function ApproveBar({ curriculumId, status }: { curriculumId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  const isDraft = status === 'draft';

  const approve = async () => {
    setBusy(true);
    await patchCurriculum(curriculumId, { status: 'approved' }).catch(() => undefined);
    router.refresh();
    setBusy(false);
  };

  const openEdit = async () => {
    try {
      const { curriculum } = await getCurriculum(curriculumId);
      const c = curriculum as { title: string; description: string | null };
      setTitle(c.title);
      setDescription(c.description ?? '');
    } catch {
      /* ignore */
    }
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setBusy(true);
    await patchCurriculum(curriculumId, { title, description }).catch(() => undefined);
    setBusy(false);
    setEditOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {isDraft
            ? 'This curriculum is a draft. Approve it to unlock the guided study path and SRS reviews.'
            : 'Curriculum approved — study lessons in order or jump into spaced-repetition flashcards.'}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={openEdit}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          {isDraft ? (
            <Button size="sm" onClick={approve} loading={busy}>
              <Check className="h-3.5 w-3.5" /> Approve & start learning
            </Button>
          ) : (
            <Button size="sm" onClick={() => router.push(`/flashcards?curriculumId=${curriculumId}`)}>
              Review flashcards
            </Button>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit curriculum">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Title</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Description</span>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveEdit} loading={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Save
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
