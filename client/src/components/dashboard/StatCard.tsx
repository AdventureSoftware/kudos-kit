import Link from 'next/link';
import { Card } from '@/components/ui';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: number;
  detail?: React.ReactNode;
  href?: string;
  emphasis?: boolean;
}

export function StatCard({ label, value, detail, href, emphasis }: StatCardProps) {
  const body = (
    <Card className={cn('h-full p-5 transition-colors', href && 'hover:border-accent')}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={cn('mt-2 text-3xl font-semibold tabular-nums', emphasis && value > 0 ? 'text-accent' : 'text-text')}>
        {value.toLocaleString('en-GB')}
      </p>
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </Card>
  );
  return href ? <Link href={href} className="block h-full">{body}</Link> : body;
}


export function TrendDetail({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (diff === 0) return <>Same as previous 7 days</>;
  return (
    <>
      <span className="font-medium text-text">{diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`}</span> vs previous 7 days
    </>
  );
}
