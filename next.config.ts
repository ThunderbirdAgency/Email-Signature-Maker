import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  async headers() {
    return [
      {
        // Signature assets are hot-linked from inside emails, so they must be
        // publicly cacheable and embeddable from any origin.
        source: "/:path(icons|i|api/qr|api/icon)/:rest*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
