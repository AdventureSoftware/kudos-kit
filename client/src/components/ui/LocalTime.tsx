'use client';

import { useSyncExternalStore } from 'react';

const FORMATS = {

  short: { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' },
  full: { dateStyle: 'medium', timeStyle: 'short' },
  clock: { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type LocalTimeFormat = keyof typeof FORMATS;

const subscribe = () => () => {};

export function LocalTime({ value, format = 'short', className }: {
  value: string | number | null | undefined;
  format?: LocalTimeFormat;
  className?: string;
}) {
  const inBrowser = useSyncExternalStore(subscribe, () => true, () => false);
  const date = value === null || value === undefined || value === '' ? null : new Date(value);
  if (!date || Number.isNaN(date.getTime())) return <span className={className}>—</span>;
  let text: string;
  try {
    text = new Intl.DateTimeFormat('en-GB', { ...FORMATS[format], ...(inBrowser ? {} : { timeZone: 'UTC' }) }).format(date);
  } catch {
    text = date.toISOString();
  }
  return <time dateTime={date.toISOString()} className={className}>{text}</time>;
}
