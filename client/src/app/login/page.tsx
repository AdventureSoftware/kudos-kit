import { loginAction } from './actions';
import { Button, Card, Input, Label } from '@/components/ui';

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
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
          <h1 className="text-base font-semibold">kudos-kit</h1>
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
