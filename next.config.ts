import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

// @ts-ignore - next-pwa type definitions conflict with Next.js 16
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default withPWA(nextConfig);
