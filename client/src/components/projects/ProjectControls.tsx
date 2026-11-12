'use client';

import { useState, useTransition } from 'react';
import { Button, ConfirmDialog, Input } from '@/components/ui';
import { renameProject, setProjectActive } from '@/app/(dashboard)/projects/actions';
import { NAME_MAX } from '@/lib/projects';
import { cn } from '@/lib/cn';


export function ProjectName({ projectKey, name }: { projectKey: string; name: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const cancel = () => {
    setEditing(false);
    setValue(name);
    setError(null);
  };

  if (!editing) {
    return (
      <span className="group inline-flex items-center gap-2">
        {name}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setEditing(true)}
          aria-label={`Rename ${name}`}
          className="opacity-70 group-hover:opacity-100 focus-visible:opacity-100"
        >
          Rename
        </Button>
      </span>
    );
  }

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const next = value.trim();
        if (!next) return setError('Please enter a name.');
        if (next === name) return cancel();
        setError(null);
        start(async () => {
          const result = await renameProject(projectKey, next);
          if (result.error) setError(result.error);
          else setEditing(false);
        });
      }}
    >
      <Input
        autoFocus
        aria-label={`New name for ${name}`}
        value={value}
        maxLength={NAME_MAX}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') cancel(); }}
        className="h-8 w-48 font-normal"
      />
      <Button type="submit" size="sm" variant="primary" disabled={pending}>{pending ? 'Saving…' : 'Save'}</Button>
      <Button type="button" size="sm" variant="ghost" onClick={cancel} disabled={pending}>Cancel</Button>
      {error && <p role="alert" className="w-full text-xs font-normal text-danger">{error}</p>}
    </form>
  );
}

/** On/off switch. Turning a project off asks first, because its sites stop sending feedback. */
export function ActiveToggle({ projectKey, name, active }: { projectKey: string; name: string; active: boolean }) {
  const [on, setOn] = useState(active);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const change = (next: boolean) => {
    setOn(next);
    setError(null);
    start(async () => {
      const result = await setProjectActive(projectKey, next);
      if (result.error) {
        setOn(!next);
        setError(result.error);
      }
    });
  };

  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`${name}: accept feedback`}
        disabled={pending}
        onClick={() => (on ? setConfirming(true) : change(true))}
        className="inline-flex cursor-pointer items-center gap-2 text-sm disabled:cursor-wait disabled:opacity-60"
      >
        <span
          aria-hidden
          className={cn(
            'relative inline-block h-5 w-9 rounded-full transition-colors',
            on ? 'bg-accent' : 'bg-border',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 size-4 rounded-full bg-surface shadow transition-transform',
              on && 'translate-x-4',
            )}
          />
        </span>
        <span className={on ? 'font-medium text-text' : 'text-muted'}>{on ? 'On' : 'Off'}</span>
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
      <ConfirmDialog
        open={confirming}
        title={`Turn off ${name}?`}
        message="Its sites stop sending feedback: the server refuses new reports for it. What it already has stays, and you can turn it back on any time."
        confirmLabel="Turn off"
        tone="danger"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          change(false);
        }}
      />
    </div>
  );
}
