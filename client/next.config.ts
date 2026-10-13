import type { NextConfig } from 'next';

const API_URL = process.env.NESTJS_API_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  // The browser only talks to the dashboard's own address. These paths are passed on to
  // NestJS, the same way nginx does in production, so local development matches it:
  //   /api/auth/*   Better Auth (the session cookie belongs to the dashboard)
  //   /kkw.js       the widget script
  //   /v1/feedback  where the widget sends feedback
  async rewrites() {
    return [
      { source: '/api/auth/:path*', destination: `${API_URL}/api/auth/:path*` },
      { source: '/kkw.js', destination: `${API_URL}/kkw.js` },
      { source: '/v1/feedback', destination: `${API_URL}/v1/feedback` },
    ];
  },
  // The dashboard used to live under /admin. Old bookmarks and emails still work.
  async redirects() {
    return [
      { source: '/admin', destination: '/', permanent: true },
      { source: '/admin/:path*', destination: '/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
