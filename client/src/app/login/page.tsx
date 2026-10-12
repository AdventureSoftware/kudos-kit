import { loginAction } from './actions';
import { Button, Card, Input, Label } from '@/components/ui';
import { Logo } from '@/components/Logo';

export const metadata = { title: 'Sign in' };

const errors: Record<string, string> = {
  invalid: 'Invalid password.',
  throttled: 'Too many attempts. Wait a minute and try again.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? (errors[error] ?? errors.invalid) : null;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h1 className="m-0"><Logo size={36} /></h1>
          <p className="text-muted">Sign in to your feedback inbox</p>
        </div>

        <form action={loginAction} className="space-y-4">
          {message && (
            <p role="alert" className="rounded-ui bg-danger-soft px-3 py-2 text-danger">
              {message}
            </p>
          )}
          <div>
            <Label htmlFor="password">Admin password</Label>
            <Input id="password" type="password" name="password" required autoFocus autoComplete="current-password" />
          </div>
          <Button type="submit" variant="primary" className="w-full">Sign in</Button>
        </form>
      </Card>
    </div>
  );
}
