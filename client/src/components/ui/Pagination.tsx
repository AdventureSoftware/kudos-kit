import Link from 'next/link';
import { cn } from '@/lib/cn';
import { buttonClass } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  hrefFor: (page: number) => string;
}

/** Page numbers to show: first, last, and the current page with one neighbour each side. */
function pageList(page: number, pages: number): Array<number | 'gap'> {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...wanted].sort((a, b) => a - b);
  const out: Array<number | 'gap'> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

export function Pagination({ page, totalPages, total, pageSize, hrefFor }: PaginationProps) {
  const pages = Math.max(totalPages, 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const disabled = 'pointer-events-none opacity-40';

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-muted">
      <span>
        Showing <span className="font-medium text-text tabular-nums">{from}–{to}</span> of{' '}
        <span className="font-medium text-text tabular-nums">{total}</span>
      </span>

      {pages > 1 && (
        <div className="flex items-center gap-1">
          <Link href={hrefFor(page - 1)} scroll={false} aria-label="Previous page"
            className={buttonClass('secondary', 'sm', page <= 1 ? disabled : undefined)}>←</Link>
          {pageList(page, pages).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} className="px-1">…</span>
            ) : (
              <Link
                key={p}
                href={hrefFor(p)}
                scroll={false}
                aria-current={p === page ? 'page' : undefined}
                className={cn(buttonClass(p === page ? 'primary' : 'ghost', 'sm'), 'min-w-7 tabular-nums')}
              >
                {p}
              </Link>
            ),
          )}
          <Link href={hrefFor(page + 1)} scroll={false} aria-label="Next page"
            className={buttonClass('secondary', 'sm', page >= pages ? disabled : undefined)}>→</Link>
        </div>
      )}
    </nav>
  );
}
