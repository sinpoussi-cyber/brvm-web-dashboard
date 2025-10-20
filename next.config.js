/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['brvm-api-xode.onrender.com'],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://brvm-api-xode.onrender.com',
    NEXT_PUBLIC_API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || '/api/v1',
  },
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/components/ui': path.resolve(__dirname, 'src/components/ui'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/lib/hooks': path.resolve(__dirname, 'src/lib/hooks'),
      '@/lib/utils': path.resolve(__dirname, 'src/lib/utils'),
      '@/lib/api': path.resolve(__dirname, 'src/lib/api'),
      '@/types': path.resolve(__dirname, 'src/types'),
    };
    return config;
  },
};

module.exports = nextConfig;
