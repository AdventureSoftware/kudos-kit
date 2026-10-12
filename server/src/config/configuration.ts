const required = (name: string, value: string | undefined, check: (v: string) => boolean, hint: string) => {
  if ((!value || !check(value)) && process.env.NODE_ENV !== 'test') throw new Error(`${name} must be set (${hint})`);
  return value ?? '';
};

export default () => {
  const adminUrl = process.env.ADMIN_URL ?? 'http://localhost:3001';
  return {
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      name: process.env.DB_NAME ?? 'feedback',
    },
    turnstile: {
      secret: process.env.TURNSTILE_SECRET ?? '',
    },
    brevo: {
      apiKey: process.env.BREVO_API_KEY ?? '',
      fromEmail: process.env.BREVO_FROM_EMAIL ?? '',
      toEmail: process.env.BREVO_TO_EMAIL ?? '',
    },
    adminUrl,
    auth: {
      secret: required('BETTER_AUTH_SECRET', process.env.BETTER_AUTH_SECRET, (v) => v.length >= 32, '>= 32 chars, e.g. openssl rand -hex 32')
        || 'test-only-secret-not-for-production-use-0000',
      baseURL: process.env.BETTER_AUTH_URL ?? adminUrl,
      trustedOrigins: [adminUrl],
    },
  };
};
