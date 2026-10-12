import Link from 'next/link';
import { buttonClass } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  /** Builds the href for a given page number, keeping current filters. */
  hrefFor: (page: number) => string;
}

export function Pagination({ page, totalPages, total, hrefFor }: PaginationProps) {
  const pages = Math.max(totalPages, 1);
  return (
    <div className="flex items-center justify-between px-4 py-3 text-xs text-muted">
      <span>
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={buttonClass('secondary', 'sm')}>← Prev</Link>
        ) : (
          <span className={buttonClass('secondary', 'sm', 'pointer-events-none opacity-40')}>← Prev</span>
        )}
        {page < pages ? (
          <Link href={hrefFor(page + 1)} className={buttonClass('secondary', 'sm')}>Next →</Link>
        ) : (
          <span className={buttonClass('secondary', 'sm', 'pointer-events-none opacity-40')}>Next →</span>
        )}
      </div>
    </div>
  );
}
