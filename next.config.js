/** @type {import('next').NextConfig} */
const fs = require('fs');
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
    NEXT_PUBLIC_API_USE_DIRECT: process.env.NEXT_PUBLIC_API_USE_DIRECT || 'auto',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');
    let tsconfig;

    try {
      tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    } catch (error) {
      // If the tsconfig cannot be read we still want to fall back to a sane alias.
      tsconfig = {};
    }

    const aliasesFromPaths = Object.entries(
      tsconfig?.compilerOptions?.paths ?? {}
    ).reduce((aliases, [aliasKey, paths]) => {
      if (!Array.isArray(paths) || paths.length === 0) {
        return aliases;
      }

      const sanitizedKey = aliasKey.replace(/\/*$/, '');
      const target = paths[0]?.replace(/\/*$/, '');
      if (!sanitizedKey || !target) {
        return aliases;
      }

      aliases[sanitizedKey] = path.resolve(__dirname, target);
      return aliases;
    }, {});

    const fallbackAliases = {
      '@': path.resolve(__dirname, 'src'),
    };

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ...fallbackAliases,
      ...aliasesFromPaths,
    };

    return config;
  },
};

module.exports = nextConfig;
