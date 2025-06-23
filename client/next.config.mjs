import withPlaiceholder from "@plaiceholder/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  logging: { fetches: { fullUrl: true } },
  serverExternalPackages: ["@react-pdf/renderer"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost", "*.flaw.uniba.sk"],
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
  async headers() {
    return [
      {
        source: "/:path*{ttf|ttc|otf|eot|woff|woff2|font.css}",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

export default withPlaiceholder(nextConfig);
