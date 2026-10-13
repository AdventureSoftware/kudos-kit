import { generateKeyPairSync, createPublicKey, verify } from 'crypto';
import { APPLE_SECRET_DAYS, appleClientSecret, enabledProviders, rotatingAppleSecret, socialProviders, type SocialSettings } from './social';

const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const appleCfg = { servicesId: 'com.example.kudos.web', teamId: 'TEAM123456', keyId: 'KEY1234567' };

const settings = (over: Partial<{ google: Partial<SocialSettings['google']>; apple: Partial<SocialSettings['apple']> }> = {}): SocialSettings => ({
  google: { clientId: '', clientSecret: '', ...over.google },
  apple: { servicesId: '', teamId: '', keyId: '', privateKeyPath: '', ...over.apple },
});

describe('enabledProviders', () => {
  it('is empty without settings', () => {
    expect(enabledProviders(settings())).toEqual([]);
  });

  it('turns on each provider only when all its values are set', () => {
    expect(enabledProviders(settings({ google: { clientId: 'id' } }))).toEqual([]);
    expect(enabledProviders(settings({ google: { clientId: 'id', clientSecret: 's' } }))).toEqual(['google']);
    expect(enabledProviders(settings({ apple: { ...appleCfg, privateKeyPath: '/k.p8' } }))).toEqual(['apple']);
  });
});

describe('appleClientSecret', () => {
  it('is an ES256 JWT that Apple can check with the key', () => {
    const now = 1_760_000_000;
    const { token, expiresAt } = appleClientSecret({ ...appleCfg, privateKey: pem }, now);
    const [h, p, sig] = token.split('.');
    expect(JSON.parse(Buffer.from(h, 'base64url').toString())).toMatchObject({ alg: 'ES256', kid: 'KEY1234567' });
    expect(JSON.parse(Buffer.from(p, 'base64url').toString())).toEqual({
      iss: 'TEAM123456', sub: 'com.example.kudos.web', aud: 'https://appleid.apple.com', iat: now, exp: now + APPLE_SECRET_DAYS * 86400,
    });
    expect(expiresAt - now).toBeLessThanOrEqual(15_777_000); // Apple's 6-month maximum
    const ok = verify('sha256', Buffer.from(`${h}.${p}`), { key: createPublicKey(privateKey), dsaEncoding: 'ieee-p1363' }, Buffer.from(sig, 'base64url'));
    expect(ok).toBe(true);
  });
});

describe('rotatingAppleSecret', () => {
  it('keeps the secret, then makes a new one when 30 days are left', () => {
    let now = 1_760_000_000;
    const get = rotatingAppleSecret({ ...appleCfg, privateKey: pem }, () => now);
    const first = get();
    now += 100 * 86400;
    expect(get()).toBe(first);
    now += 60 * 86400; // 160 days in: 20 left
    expect(get()).not.toBe(first);
  });
});

describe('socialProviders', () => {
  it('never lets the sign-in page create accounts', () => {
    const p = socialProviders(settings({ google: { clientId: 'id', clientSecret: 's' }, apple: { ...appleCfg, privateKeyPath: '/k.p8' } }), () => pem) as unknown as Record<'google' | 'apple', Record<string, unknown>>;
    expect(p.google.disableImplicitSignUp).toBe(true);
    expect(p.apple.disableImplicitSignUp).toBe(true);
    expect(p.apple.clientId).toBe('com.example.kudos.web');
    expect(String(p.apple.clientSecret).split('.')).toHaveLength(3);
  });

  it('explains a missing Apple key file', () => {
    expect(() => socialProviders(settings({ apple: { ...appleCfg, privateKeyPath: '/missing.p8' } }), () => { throw new Error('ENOENT'); }))
      .toThrow(/APPLE_PRIVATE_KEY_PATH/);
  });
});
