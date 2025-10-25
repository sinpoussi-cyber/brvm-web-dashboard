/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Proxy API vers Render en local
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://brvm-api-xode.onrender.com/api/:path*",
      },
    ];
  },

  // ✅ Variables d'environnement pour build Vercel
  env: {
    NEXT_PUBLIC_API_URL: "https://brvm-api-xode.onrender.com",
    NEXT_PUBLIC_API_VERSION: "/api/v1",
  },
};

module.exports = nextConfig;
