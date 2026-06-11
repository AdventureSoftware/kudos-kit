export default () => ({
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
  adminUrl: process.env.ADMIN_URL ?? 'http://localhost:3001',
  adminPassword: process.env.ADMIN_PASSWORD ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-prod',
});
