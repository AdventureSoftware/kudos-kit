'use client';

import { useEffect, useId, useRef } from 'react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible confirmation dialog built on the native <dialog> element:
 * focus is trapped inside, Escape cancels, and the page behind is inert.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={message ? descId : undefined}
      // Escape key and backdrop clicks both count as cancel.
      onCancel={(e) => { e.preventDefault(); onCancel(); }}
      onClick={(e) => { if (e.target === ref.current) onCancel(); }}
      className="kk-dialog m-auto w-[calc(100%-2rem)] max-w-sm rounded-ui border border-border bg-surface p-0 text-text shadow-xl"
    >
      <div className="p-5">
        <h2 id={titleId} className="text-base font-semibold">{title}</h2>
        {message && <div id={descId} className="mt-1.5 text-muted">{message}</div>}
      </div>
      <div className="flex justify-end gap-2 border-t border-border bg-surface-muted/50 px-5 py-3">
        <Button type="button" variant="secondary" onClick={onCancel} autoFocus>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={tone === 'danger' ? 'dangerSolid' : 'primary'}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
