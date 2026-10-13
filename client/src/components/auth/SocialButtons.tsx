'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { authClient, authErrorMessage } from '@/lib/auth-client';
import { PROVIDER_NAMES, type SocialProvider } from '@/lib/social';

interface SocialButtonsProps {
  providers: SocialProvider[];
  callbackURL: string;
  errorCallbackURL: string;
  requestSignUp?: boolean;
  verb?: string;
}

export function SocialButtons({ providers, callbackURL, errorCallbackURL, requestSignUp, verb = 'Continue with' }: SocialButtonsProps) {
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (providers.length === 0) return null;

  return (
    <div className="space-y-2">
      {providers.map((provider) => (
        <Button
          key={provider}
          type="button"
          variant="secondary"
          className="w-full"
          disabled={pending !== null}
          onClick={async () => {
            setPending(provider);
            setError(null);
            const { error } = await authClient.signIn.social({
              provider,
              callbackURL,
              newUserCallbackURL: callbackURL,
              errorCallbackURL,
              requestSignUp,
            });
            // On success the browser is already on its way to Google/Apple.
            if (error) {
              setError(authErrorMessage(error));
              setPending(null);
            }
          }}
        >
          {pending === provider ? 'Opening…' : `${verb} ${PROVIDER_NAMES[provider]}`}
        </Button>
      ))}
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}


export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted" aria-hidden>
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
