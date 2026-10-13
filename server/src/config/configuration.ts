const required = (name: string, value: string | undefined, check: (v: string) => boolean, hint: string) => {
  if ((!value || !check(value)) && process.env.NODE_ENV !== 'test') throw new Error(`${name} must be set (${hint})`);
  return value ?? '';
};


const retentionDays = (value: string | undefined) => {
  const days = Number(value ?? 90);
  return Number.isInteger(days) && days >= 0 ? days : 90;
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
    retention: {
      // Feedback is deleted after this many days (0 = keep forever). Shown on the /privacy page.
      feedbackDays: retentionDays(process.env.FEEDBACK_RETENTION_DAYS),
    },
    auth: {
      secret: required('BETTER_AUTH_SECRET', process.env.BETTER_AUTH_SECRET, (v) => v.length >= 32, '>= 32 chars, e.g. openssl rand -hex 32')
        || 'test-only-secret-not-for-production-use-0000',
      baseURL: process.env.BETTER_AUTH_URL ?? adminUrl,
      trustedOrigins: [adminUrl],
      // Optional. Each provider turns on when all of its values are set (see server/src/auth/social.ts).
      social: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID ?? '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        },
        apple: {
          servicesId: process.env.APPLE_SERVICES_ID ?? '',
          teamId: process.env.APPLE_TEAM_ID ?? '',
          keyId: process.env.APPLE_KEY_ID ?? '',
          privateKeyPath: process.env.APPLE_PRIVATE_KEY_PATH ?? '',
        },
      },
    },
  };
};
