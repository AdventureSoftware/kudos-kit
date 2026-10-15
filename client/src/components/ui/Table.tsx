import Link from 'next/link';
import { cn } from '@/lib/cn';

export function Table({ className, ...rest }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-sm', className)} {...rest} />
    </div>
  );
}

const thBase =
  'border-b border-table-head-border bg-table-head text-left text-xs font-bold uppercase tracking-wide text-table-head-text';

export function Th({ className, ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn(thBase, 'px-4 py-2.5', className)} {...rest} />;
}

interface SortableThProps {
  label: string;
  active: boolean;
  dir: 'asc' | 'desc';
  href: string;
  className?: string;
}


export function SortableTh({ label, active, dir, href, className }: SortableThProps) {
  return (
    <th
      className={cn(thBase, className)}
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <Link
        href={href}
        scroll={false}
        className={cn(
          'group inline-flex w-full items-center gap-1 px-4 py-2.5 hover:text-accent-hover',
          active && 'text-accent-hover',
        )}
      >
        {label}
        <span aria-hidden className={cn('text-[10px]', active ? 'opacity-100' : 'opacity-0 group-hover:opacity-50')}>
          {active && dir === 'asc' ? '▲' : '▼'}
        </span>
      </Link>
    </th>
  );
}

export function Td({ className, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('border-b border-border px-4 py-3 align-middle', className)} {...rest} />;
}

export function Tr({ className, ...rest }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('hover:bg-surface-muted/60', className)} {...rest} />;
}
