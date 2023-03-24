/* eslint-disable import/no-extraneous-dependencies */
const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    // ssr and displayName are configured by default
    styledComponents: true,
  },
  i18n,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "gateway",
        port: "5000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
    ],
  },
};

module.exports = nextConfig;
