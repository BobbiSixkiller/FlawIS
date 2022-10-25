/* eslint-disable import/no-extraneous-dependencies */
const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    // ssr and displayName are configured by default
    styledComponents: true,
  },
  i18n
};

module.exports = nextConfig;
