import Link from 'next/link';

interface Row {
  label: string;
  value: number;
  href?: string;
  note?: string;
}

export function Breakdown({ rows, total }: { rows: Row[]; total: number }) {
  if (rows.length === 0) return <p className="py-6 text-center text-muted">No data yet</p>;
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
        const label = r.href ? (
          <Link href={r.href} className="font-medium text-text hover:text-accent">{r.label}</Link>
        ) : (
          <span className="font-medium text-text">{r.label}</span>
        );
        return (
          <li key={r.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              {label}
              <span className="tabular-nums text-muted">
                {r.note && <span className="mr-2">{r.note}</span>}
                <span className="font-medium text-text">{r.value}</span> · {pct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-muted">
              <div className="h-1.5 rounded-full bg-accent" style={{ width: `${(r.value / max) * 100}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
