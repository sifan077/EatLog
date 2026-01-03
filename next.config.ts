import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

// Only enable PWA in production
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
  });
  module.exports = withPWA(nextConfig);
} else {
  module.exports = nextConfig;
}

export const turbopack = {};
