import { createPrivateKey, sign } from 'crypto';
import { readFileSync } from 'fs';
import type { BetterAuthOptions } from 'better-auth';

/** Google and Apple sign-in.  */
export interface SocialSettings {
  google: { clientId: string; clientSecret: string };
  apple: {
    servicesId: string;
    teamId: string;
    keyId: string;
    privateKeyPath: string;
  };
}

export type SocialProviderId = 'google' | 'apple';

export const APPLE_ORIGIN = 'https://appleid.apple.com';

export function enabledProviders(s?: SocialSettings): SocialProviderId[] {
  if (!s) return [];
  const list: SocialProviderId[] = [];
  if (s.google.clientId && s.google.clientSecret) list.push('google');
  const a = s.apple;
  if (a.servicesId && a.teamId && a.keyId && a.privateKeyPath) list.push('apple');
  return list;
}

const b64url = (data: string | Buffer) => Buffer.from(data).toString('base64url');

export const APPLE_SECRET_DAYS = 180;
const RENEW_WHEN_DAYS_LEFT = 30;
const DAY = 24 * 60 * 60;


export function appleClientSecret(
  cfg: { servicesId: string; teamId: string; keyId: string; privateKey: string },
  nowSeconds = Math.floor(Date.now() / 1000),
): { token: string; expiresAt: number } {
  const expiresAt = nowSeconds + APPLE_SECRET_DAYS * DAY;
  const header = b64url(JSON.stringify({ alg: 'ES256', kid: cfg.keyId, typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({ iss: cfg.teamId, iat: nowSeconds, exp: expiresAt, aud: APPLE_ORIGIN, sub: cfg.servicesId }),
  );
  const signature = sign('sha256', Buffer.from(`${header}.${payload}`), {
    key: createPrivateKey(cfg.privateKey),
    dsaEncoding: 'ieee-p1363', // the signature format JWTs use
  });
  return { token: `${header}.${payload}.${b64url(signature)}`, expiresAt };
}


export function rotatingAppleSecret(cfg: Parameters<typeof appleClientSecret>[0], now = () => Math.floor(Date.now() / 1000)) {
  let current = appleClientSecret(cfg, now());
  return () => {
    if (current.expiresAt - now() < RENEW_WHEN_DAYS_LEFT * DAY) current = appleClientSecret(cfg, now());
    return current.token;
  };
}


export function socialProviders(s?: SocialSettings, readKey = (path: string) => readFileSync(path, 'utf8')): BetterAuthOptions['socialProviders'] {
  const enabled = enabledProviders(s);
  const providers: NonNullable<BetterAuthOptions['socialProviders']> = {};
  if (s && enabled.includes('google')) {
    providers.google = {
      clientId: s.google.clientId,
      clientSecret: s.google.clientSecret,
      disableImplicitSignUp: true,
      prompt: 'select_account',
    };
  }
  if (s && enabled.includes('apple')) {
    let privateKey: string;
    try {
      privateKey = readKey(s.apple.privateKeyPath);
    } catch {
      throw new Error(`APPLE_PRIVATE_KEY_PATH: cannot read ${s.apple.privateKeyPath}. Point it at the AuthKey_….p8 file from Apple.`);
    }
    const secret = rotatingAppleSecret({ ...s.apple, privateKey });
    providers.apple = {
      clientId: s.apple.servicesId,

      get clientSecret() {
        return secret();
      },
      disableImplicitSignUp: true,
    };
  }
  return providers;
}
