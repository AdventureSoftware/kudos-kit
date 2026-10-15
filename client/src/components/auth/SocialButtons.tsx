'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { authClient, authErrorMessage } from '@/lib/auth-client';
import { PROVIDER_NAMES, type SocialProvider } from '@/lib/social';
import { ProviderIcon } from './ProviderIcons';

interface SocialButtonsProps {
  providers: SocialProvider[];
  callbackURL: string;
  errorCallbackURL: string;
  requestSignUp?: boolean;
  verb?: string;
}

const base =
  'inline-flex h-8.5 w-full items-center justify-center gap-2.5 rounded-ui border px-4 text-sm font-medium ' +
  'transition-colors cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60';

const styles: Record<SocialProvider, string> = {
  google:
    'bg-white border-[#747775] text-[#1F1F1F] hover:bg-[#f8f9fa] ' +
    'dark:bg-[#131314] dark:border-[#8E918F] dark:text-[#E3E3E3] dark:hover:bg-[#1f1f20]',
  apple: 'bg-black border-black text-white hover:bg-[#1f1f1f] dark:bg-white dark:border-white dark:text-black dark:hover:bg-[#ececec]',
};

export function SocialButtons({ providers, callbackURL, errorCallbackURL, requestSignUp, verb = 'Continue with' }: SocialButtonsProps) {
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (providers.length === 0) return null;

  return (
    <div className="space-y-2">
      {providers.map((provider) => (
        <button
          key={provider}
          type="button"
          className={cn(base, styles[provider])}
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
            if (error) {
              setError(authErrorMessage(error));
              setPending(null);
            }
          }}
        >
          <ProviderIcon provider={provider} />
          <span>{pending === provider ? 'Opening…' : `${verb} ${PROVIDER_NAMES[provider]}`}</span>
        </button>
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
