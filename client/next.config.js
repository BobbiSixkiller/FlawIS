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
    domains: [
      "localhost",
      "client",
      "gateway",
      "conferences.flaw.uniba.sk",
      "flawis.flaw.uniba.sk",
      "flawis-backend.flaw.uniba.sk",
    ],
  },
  compress: false,
};

module.exports = nextConfig;
