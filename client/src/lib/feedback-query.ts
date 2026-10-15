
export const SORT_FIELDS = ['created_at', 'project', 'type', 'status'] as const;
export type SortField = (typeof SORT_FIELDS)[number];
export type SortDir = 'asc' | 'desc';

export const STATUSES = ['new', 'triaged', 'done'] as const;
export const TYPES = ['bug', 'idea', 'praise', 'other'] as const;
export type Status = (typeof STATUSES)[number];
export type FeedbackType = (typeof TYPES)[number];

export interface FeedbackQuery {
  project?: string;
  status?: Status;
  type?: FeedbackType;
  testimonial?: boolean;
  q?: string;
  page: number;
  sort: SortField;
  dir: SortDir;
  item?: string;
}

export const DEFAULT_SORT: SortField = 'created_at';
export const DEFAULT_DIR: SortDir = 'desc';

type RawParams = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const oneOf = <T extends string>(list: readonly T[], v?: string) =>
  (list as readonly string[]).includes(v ?? '') ? (v as T) : undefined;

export function parseFeedbackQuery(raw: RawParams): FeedbackQuery {
  const sortRaw = first(raw.sort);
  const item = first(raw.item);
  return {
    project: first(raw.project),
    status: oneOf(STATUSES, first(raw.status)),
    type: oneOf(TYPES, first(raw.type)),
    testimonial: first(raw.testimonial) === '1' || undefined,
    q: first(raw.q)?.trim().slice(0, 100) || undefined,
    page: Math.max(1, Number(first(raw.page)) || 1),
    sort: (SORT_FIELDS as readonly string[]).includes(sortRaw ?? '') ? (sortRaw as SortField) : DEFAULT_SORT,
    dir: first(raw.dir) === 'asc' ? 'asc' : first(raw.dir) === 'desc' ? 'desc' : DEFAULT_DIR,
    item: item && /^\d+$/.test(item) ? item : undefined,
  };
}

export function toApiParams(q: FeedbackQuery): URLSearchParams {
  const p = new URLSearchParams();
  if (q.project) p.set('project', q.project);
  if (q.status) p.set('status', q.status);
  if (q.type) p.set('type', q.type);
  if (q.testimonial) p.set('testimonial', '1');
  if (q.q) p.set('q', q.q);
  if (q.page > 1) p.set('page', String(q.page));
  p.set('sort', q.sort);
  p.set('dir', q.dir);
  return p;
}

export const isFiltered = (q: FeedbackQuery) => Boolean(q.project || q.status || q.type || q.testimonial || q.q);

export function feedbackHref(q: FeedbackQuery, change: Partial<FeedbackQuery> = {}): string {
  const next = { ...q, ...change };
  const p = new URLSearchParams();
  if (next.project) p.set('project', next.project);
  if (next.status) p.set('status', next.status);
  if (next.type) p.set('type', next.type);
  if (next.testimonial) p.set('testimonial', '1');
  if (next.q) p.set('q', next.q);
  if (next.sort !== DEFAULT_SORT || next.dir !== DEFAULT_DIR) {
    p.set('sort', next.sort);
    p.set('dir', next.dir);
  }
  if (next.page > 1) p.set('page', String(next.page));
  if (next.item) p.set('item', next.item);
  const s = p.toString();
  return `/feedback${s ? `?${s}` : ''}`;
}
