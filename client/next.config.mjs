import withPlaiceholder from "@plaiceholder/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: { fetches: { fullUrl: true } },
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    serverActions: {
      allowedOrigins: ["http://localhost"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "minio",
        port: "9000",
      },
      {
        protocol: "http",
        hostname: "minio-staging",
        port: "9000",
      },
      { protocol: "https", hostname: "avatar.iran.liara.run" },
    ],
  },
};

export default withPlaiceholder(nextConfig);
