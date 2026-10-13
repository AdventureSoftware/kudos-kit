'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MenuSelect } from '@/components/ui';
import { cn } from '@/lib/cn';
import { feedbackHref, isFiltered, TYPES, type FeedbackQuery, type FeedbackType, type Status } from '@/lib/feedback-query';
import type { FeedbackListResponse } from './types';

const SEARCH_DELAY_MS = 300;

const STATUS_TABS: Array<{ value?: Status; label: string; count: keyof FeedbackListResponse['statusCounts'] }> = [
  { value: undefined, label: 'All', count: 'all' },
  { value: 'new', label: 'New', count: 'new' },
  { value: 'triaged', label: 'Triaged', count: 'triaged' },
  { value: 'done', label: 'Done', count: 'done' },
];

const TYPE_LABELS: Record<FeedbackType, string> = { bug: 'Bugs', idea: 'Ideas', other: 'Other' };

interface FeedbackToolbarProps {
  query: FeedbackQuery;
  projects: string[];
  counts: FeedbackListResponse['statusCounts'];
}

export function FeedbackToolbar({ query, projects, counts }: FeedbackToolbarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const go = (change: Partial<FeedbackQuery>, replace = false) => {
    const href = feedbackHref(query, { ...change, page: 1, item: undefined });
    startTransition(() => (replace ? router.replace(href, { scroll: false }) : router.push(href, { scroll: false })));
  };

  const [text, setText] = useState(query.q ?? '');
  const lastSent = useRef(query.q ?? '');
  useEffect(() => {
    if ((query.q ?? '') !== lastSent.current) {
      lastSent.current = query.q ?? '';
      setText(query.q ?? '');
    }
  }, [query.q]);
  useEffect(() => {
    const value = text.trim();
    if (value === lastSent.current) return;
    const timer = setTimeout(() => {
      lastSent.current = value;
      go({ q: value || undefined }, true);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Filter by status" className="inline-flex rounded-ui bg-surface-muted p-1">
        {STATUS_TABS.map((tab) => {
          const active = query.status === tab.value;
          return (
            <Link
              key={tab.label}
              href={feedbackHref(query, { status: tab.value, page: 1, item: undefined })}
              scroll={false}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm font-medium transition-colors',
                active ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text',
              )}
            >
              {tab.label}
              <span className={cn('tabular-nums text-xs', active ? 'text-accent' : 'text-muted')}>{counts[tab.count]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
        {projects.length > 1 && (
          <MenuSelect
            label="Project"
            value={query.project ?? ''}
            options={[{ value: '', label: 'All projects' }, ...projects.map((p) => ({ value: p, label: p }))]}
            onChange={(v) => go({ project: v || undefined })}
          />
        )}

        <MenuSelect
          label="Type"
          value={query.type ?? ''}
          options={[{ value: '', label: 'All types' }, ...TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))]}
          onChange={(v) => go({ type: (v || undefined) as FeedbackType | undefined })}
        />

        <label className="relative block w-full sm:w-72">
          <span className="sr-only">Search feedback</span>
          <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 3.5 3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search text, email or CP-12"
            maxLength={100}
            className="h-9 w-full rounded-ui border border-border bg-surface pl-9 pr-8 text-sm text-text placeholder:text-muted focus:border-accent focus:outline-none"
          />
          {pending && (
            <span aria-hidden className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-border border-t-accent" />
          )}
        </label>

        {isFiltered(query) && (
          <Link
            href={feedbackHref(query, { project: undefined, status: undefined, type: undefined, q: undefined, page: 1, item: undefined })}
            scroll={false}
            className="text-sm font-medium text-muted hover:text-text"
          >
            Clear
          </Link>
        )}
      </div>
    </div>
  );
}
