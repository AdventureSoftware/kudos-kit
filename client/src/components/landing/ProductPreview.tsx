import { CHAT_ICON, Icon, TYPE_ICONS } from './icons';


export function ProductPreview() {
  return (
    <div aria-hidden className="relative mx-auto w-full min-w-0 max-w-xl select-none sm:pb-20 lg:pb-14">
      <AppWindow />
      <InboxCard />
    </div>
  );
}

function AppWindow() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xl shadow-black/5">
      <div className="flex items-center gap-2 border-b border-border bg-surface-muted px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#f87171]" />
        <span className="size-2.5 rounded-full bg-[#fbbf24]" />
        <span className="size-2.5 rounded-full bg-[#4ade80]" />
        <span className="ml-3 flex-1 truncate rounded-md bg-surface px-3 py-1 text-xs text-muted">your-app.com/editor</span>
      </div>

      <div className="relative h-[25rem] bg-bg/60 p-5">
        <div className="h-3 w-1/3 rounded bg-border" />
        <div className="mt-3 h-2 w-2/3 rounded bg-border/70" />
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="h-20 rounded-lg bg-border/60" />
          <div className="h-20 rounded-lg bg-border/60" />
          <div className="h-20 rounded-lg bg-border/60" />
        </div>
        <div className="mt-3 h-2 w-1/2 rounded bg-border/70" />

        <WidgetPanel />
      </div>
    </div>
  );
}

const TYPES = [
  { key: 'bug', label: 'Bug', hint: 'Something isn’t working' },
  { key: 'idea', label: 'Idea', hint: 'A suggestion' },
  { key: 'praise', label: 'Praise', hint: 'Something you like' },
  { key: 'other', label: 'Other', hint: 'Anything else' },
] as const;

function WidgetPanel() {
  return (
    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-2.5">
      <div className="w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
        <div className="bg-accent-soft px-4 py-3">
          <p className="text-sm font-bold">Send feedback</p>
          <p className="text-xs text-muted">What would you like to share?</p>
        </div>
        <div className="grid grid-cols-2 gap-2 p-3">
          {TYPES.map((t) => (
            <div
              key={t.key}
              className={
                'rounded-lg border px-2.5 py-2 ' +
                (t.key === 'praise' ? 'border-accent bg-accent-soft' : 'border-border')
              }
            >
              <Icon className="size-4 text-accent">{TYPE_ICONS[t.key]}</Icon>
              <p className="mt-1 text-xs font-bold">{t.label}</p>
              <p className="text-[10px] leading-tight text-muted">{t.hint}</p>
            </div>
          ))}
        </div>
        <p className="flex items-center justify-center gap-1 border-t border-border py-1.5 text-[10px] text-muted">
          <span className="inline-block size-2 rounded-full bg-brand" /> Powered by Kudos Kit
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-bold text-accent-contrast shadow-md">
        <Icon className="size-4">{CHAT_ICON}</Icon>
        Feedback
      </span>
    </div>
  );
}

const ROWS = [
  { ref: 'APP-12', type: 'Bug', text: 'Export button does nothing in Safari', status: 'New', tone: 'bg-info-soft text-info' },
  { ref: 'APP-11', type: 'Praise', text: '★★★★★ The new templates saved me hours', status: 'Testimonial', tone: 'bg-success-soft text-success' },
  { ref: 'APP-10', type: 'Idea', text: 'Let me duplicate a whole project', status: 'Triaged', tone: 'bg-warning-soft text-warning' },
];

function InboxCard() {
  return (
    <div className="relative mt-4 w-full overflow-hidden sm:absolute sm:bottom-0 sm:left-0 sm:mt-0 rounded-xl border border-border bg-surface shadow-xl shadow-black/10 sm:-left-6 sm:w-[64%] lg:-left-10">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <p className="text-sm font-bold">Feedback</p>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent">3 new today</span>
      </div>
      <ul className="divide-y divide-border">
        {ROWS.map((r) => (
          <li key={r.ref} className="flex items-center gap-3 px-4 py-2.5 text-xs">
            <span className="w-12 shrink-0 font-mono text-muted">{r.ref}</span>
            <span className="min-w-0 flex-1 truncate">
              <span className="font-bold">{r.type}</span> · {r.text}
            </span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${r.tone}`}>{r.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
