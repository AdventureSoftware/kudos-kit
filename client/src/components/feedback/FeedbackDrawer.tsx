import Link from 'next/link';
import { Badge, buttonClass, typeTone, type Tone } from '@/components/ui';
import { cn } from '@/lib/cn';
import { CloseOnEscape } from './CloseOnEscape';
import { DeleteButton, StatusButton } from './FeedbackActions';

export interface ConsoleEntry { t: number; level: string; msg: string }
export interface ErrorEntry { message: string; stack?: string; filename?: string; lineno?: number }
export interface FeedbackContext {
  url?: string;
  referrer?: string;
  userAgent?: string;
  viewport?: { w: number; h: number };
  language?: string;
  build?: string;
  ts?: string;
}

export interface FeedbackDetail {
  id: string;
  ref: string;
  project: string;
  type: string;
  message: string;
  email: string | null;
  user_ctx: { id?: string; plan?: string } | null;
  context: FeedbackContext | null;
  console_logs: ConsoleEntry[] | null;
  errors: ErrorEntry[] | null;
  status: string;
  created_at: string;
}

const fullDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });

const levelTone: Record<string, Tone> = { error: 'danger', warn: 'warning', info: 'accent' };

/** Only http(s) links are clickable; anything else is shown as plain text. */
function safeUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
}

export function FeedbackDrawer({ item, closeHref, canDelete }: { item: FeedbackDetail | null; closeHref: string; canDelete: boolean }) {
  return (
    <div className="fixed inset-0 z-40">
      <CloseOnEscape href={closeHref} />
      <Link href={closeHref} scroll={false} aria-label="Close details" className="kk-fade-in absolute inset-0 bg-black/30" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-detail-title"
        className="kk-drawer-in absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-border bg-surface shadow-xl"
      >
        {item ? <Detail item={item} closeHref={closeHref} canDelete={canDelete} /> : <Missing closeHref={closeHref} />}
      </aside>
    </div>
  );
}

function Missing({ closeHref }: { closeHref: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <p id="feedback-detail-title" className="font-medium">This feedback no longer exists</p>
      <p className="text-muted">It may have been deleted or removed by the 90-day retention.</p>
      <Link href={closeHref} scroll={false} className={buttonClass('secondary')}>Back to the list</Link>
    </div>
  );
}

function Detail({ item, closeHref, canDelete }: { item: FeedbackDetail; closeHref: string; canDelete: boolean }) {
  const ctx = item.context ?? {};
  const logs = item.console_logs ?? [];
  const errors = item.errors ?? [];
  const pageUrl = safeUrl(ctx.url);
  const referrer = safeUrl(ctx.referrer);

  return (
    <>
      <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted">{item.ref}</span>
            <Badge tone={typeTone[item.type] ?? 'neutral'}>{item.type}</Badge>
            <StatusButton id={item.id} status={item.status} />
          </div>
          <h2 id="feedback-detail-title" className="text-base font-semibold">
            {item.project} · {fullDate.format(new Date(item.created_at))}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {canDelete && <DeleteButton id={item.id} label={item.ref} closeHref={closeHref} />}
          <Link href={closeHref} scroll={false} className={buttonClass('ghost', 'sm')} aria-label="Close">✕</Link>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        <Section title="Message">
          <p className="whitespace-pre-wrap break-words leading-relaxed">{item.message}</p>
        </Section>

        <Section title="Reporter">
          <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2">
            <Row label="Email">
              {item.email ? <a href={`mailto:${item.email}`} className="text-accent hover:underline">{item.email}</a> : <span className="text-muted">Not given</span>}
            </Row>
            {item.user_ctx?.id && <Row label="User ID"><span className="font-mono text-xs">{item.user_ctx.id}</span></Row>}
            {item.user_ctx?.plan && <Row label="Plan">{item.user_ctx.plan}</Row>}
          </dl>
        </Section>

        <Section title="Context">
          {item.context ? (
            <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2">
              <Row label="Page">
                {pageUrl ? <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="break-all text-accent hover:underline">{ctx.url}</a> : <span className="break-all">{ctx.url ?? '—'}</span>}
              </Row>
              {ctx.referrer && <Row label="Came from">{referrer ? <a href={referrer} target="_blank" rel="noopener noreferrer" className="break-all text-accent hover:underline">{ctx.referrer}</a> : <span className="break-all">{ctx.referrer}</span>}</Row>}
              {ctx.userAgent && <Row label="Browser"><span className="break-words text-xs">{ctx.userAgent}</span></Row>}
              {ctx.viewport && <Row label="Window">{ctx.viewport.w} × {ctx.viewport.h} px</Row>}
              {ctx.language && <Row label="Language">{ctx.language}</Row>}
              {ctx.build && <Row label="App build"><span className="font-mono text-xs">{ctx.build}</span></Row>}
            </dl>
          ) : (
            <p className="text-muted">No context captured.</p>
          )}
        </Section>

        <Section title="Errors" count={errors.length}>
          {errors.length === 0 ? (
            <p className="text-muted">{item.type === 'bug' ? 'No uncaught errors before this report.' : 'Only bug reports include errors.'}</p>
          ) : (
            <ul className="space-y-3">
              {errors.map((e, i) => (
                <li key={i} className="rounded-ui border border-border p-3">
                  <p className="break-words font-medium text-danger">{e.message}</p>
                  {e.filename && <p className="mt-0.5 break-all text-xs text-muted">{e.filename}{e.lineno ? `:${e.lineno}` : ''}</p>}
                  {e.stack && <pre className="mt-2 overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed text-muted">{e.stack}</pre>}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Console" count={logs.length}>
          {logs.length === 0 ? (
            <p className="text-muted">{item.type === 'bug' ? 'Nothing was logged before this report.' : 'Only bug reports include console logs.'}</p>
          ) : (
            <ol className="divide-y divide-border rounded-ui border border-border font-mono text-xs">
              {logs.map((l, i) => (
                <li key={i} className={cn('grid grid-cols-[6.5rem_3.5rem_1fr] items-start gap-3 px-3 py-2', l.level === 'error' && 'bg-danger-soft/40')}>
                  <span className="tabular-nums text-muted">{clock.format(new Date(l.t))}</span>
                  <span><Badge tone={levelTone[l.level] ?? 'neutral'}>{l.level}</Badge></span>
                  <span className="whitespace-pre-wrap break-words">{l.msg}</span>
                </li>
              ))}
            </ol>
          )}
        </Section>
      </div>
    </>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
        {title}
        {count !== undefined && <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] tabular-nums">{count}</span>}
      </h3>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}
