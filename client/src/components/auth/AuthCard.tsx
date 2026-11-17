import Link from 'next/link';
import { Card } from '@/components/ui';
import { Logo } from '@/components/Logo';

export function AuthCard({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h1 className="m-0">
            <Link href="/" aria-label="Kudos Kit home" className="inline-flex"><Logo size={36} /></Link>
          </h1>
          <p className="text-muted">{subtitle}</p>
        </div>
        {children}
        <p className="mt-8 text-center text-xs">
          <Link href="/privacy" className="text-muted hover:text-text">Privacy</Link>
        </p>
      </Card>
    </div>
  );
}


export { FormError } from '@/components/ui/FormError';
