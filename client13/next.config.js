/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: { fetches: { fullUrl: true } },
  experimental: {
    serverActions: {
      allowedOrigins: ["http://localhost"],
    },
  },
};

module.exports = nextConfig;
