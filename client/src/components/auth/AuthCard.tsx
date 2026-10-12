import { Card } from '@/components/ui';
import { Logo } from '@/components/Logo';


export function AuthCard({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h1 className="m-0"><Logo size={36} /></h1>
          <p className="text-muted">{subtitle}</p>
        </div>
        {children}
      </Card>
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="alert" className="rounded-ui bg-danger-soft px-3 py-2 text-danger">{message}</p>;
}
