import type { NextConfig } from 'next';

const API_URL = process.env.NESTJS_API_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/api/auth/:path*', destination: `${API_URL}/api/auth/:path*` }];
  },
};

export default nextConfig;
