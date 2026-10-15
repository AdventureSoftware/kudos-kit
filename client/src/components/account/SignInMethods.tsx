'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, FormError } from '@/components/ui';
import { ProviderIcon } from '@/components/auth/ProviderIcons';
import { authClient, authErrorMessage } from '@/lib/auth-client';
import { PROVIDER_NAMES, type SocialProvider } from '@/lib/social';

interface SignInMethodsProps {
  methods: Array<{ id: string; providerId: string }>;
  providers: SocialProvider[];
  email: string;
  notice?: { tone: 'success' | 'danger'; text: string } | null;
}

const HINTS: Record<SocialProvider, string> = {
  google: 'Sign in with your Google account.',
  apple: 'Works even if you choose “Hide My Email”.',
};


export function SignInMethods({ methods, providers, email, notice = null }: SignInMethodsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);
  const find = (providerId: string) => methods.find((m) => m.providerId === providerId);
  const hasPassword = Boolean(find('credential'));
  const onlyOne = methods.length <= 1;

  async function run(key: string, action: () => Promise<{ error: Parameters<typeof authErrorMessage>[0] | null }>, refresh = true) {
    setBusy(key);
    setError(null);
    const { error } = await action();
    setBusy(null);
    if (error) return setError(authErrorMessage(error)), false;
    if (refresh) router.refresh();
    return true;
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold">Sign-in methods</h2>
      {notice && (
        <p role="status" className={`mt-3 rounded-ui px-3 py-2 ${notice.tone === 'success' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
          {notice.text}
        </p>
      )}
      <ul className="mt-3 divide-y divide-border">
        <li className="flex flex-wrap items-center justify-between gap-2 py-3">
          <div>
            <p className="font-medium text-text">Password</p>
            <p className="text-xs text-muted">{hasPassword ? `Sign in with ${email} and your password.` : 'Not set. We’ll email you a link to choose one.'}</p>
          </div>
          {hasPassword ? (
            <Badge tone="success">Set</Badge>
          ) : linkSent ? (
            <span role="status" className="text-sm text-success">Link sent to {email}</span>
          ) : (
            <Button
              size="sm"
              disabled={busy !== null}
              onClick={async () => {
                if (await run('password', () => authClient.requestPasswordReset({ email }), false)) setLinkSent(true);
              }}
            >
              {busy === 'password' ? 'Sending…' : 'Email me a link'}
            </Button>
          )}
        </li>
        {providers.map((provider) => {
          const connected = find(provider);
          const name = PROVIDER_NAMES[provider];
          return (
            <li key={provider} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-ui border border-border bg-surface text-text">
                  <ProviderIcon provider={provider} className="size-4" />
                </span>
                <div>
                  <p className="font-medium text-text">
                    {name} {connected && <Badge tone="success" className="ml-1 align-middle">Connected</Badge>}
                  </p>
                  <p className="text-xs text-muted">{HINTS[provider]}</p>
                </div>
              </div>
              {connected ? (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={busy !== null || onlyOne}
                  title={onlyOne ? 'This is your only way to sign in' : undefined}
                  onClick={() => run(provider, () => authClient.unlinkAccount({ accountId: connected.id }))}
                >
                  {busy === provider ? 'Disconnecting…' : 'Disconnect'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={busy !== null}
                  onClick={() =>
                    // On success the browser leaves for Google/Apple and comes back here.
                    run(provider, () =>
                      authClient.linkSocial({
                        provider,
                        callbackURL: `/account?connected=${provider}`,
                        errorCallbackURL: '/account',
                      }),
                    false)
                  }
                >
                  <ProviderIcon provider={provider} className="size-3.5" />
                  {busy === provider ? 'Opening…' : `Connect ${name}`}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <FormError message={error} className="mt-3" />
    </Card>
  );
}
