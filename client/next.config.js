/* eslint-disable import/no-extraneous-dependencies */
const { i18n } = require("./next-i18next.config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  compiler: {
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
      "client-staging",
      "gateway-staging",
      "conferences-staging.flaw.uniba.sk",
      "flawis-staging.flaw.uniba.sk",
      "flawis-backend-staging.flaw.uniba.sk",
    ],
  },
};

module.exports = nextConfig;
