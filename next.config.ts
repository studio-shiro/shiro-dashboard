import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eyipyttwyaongflydfbt.supabase.co",
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.svg": {
        loaders: [{ loader: "@svgr/webpack", options: {} }],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    // Find Next.js's default SVG file-loader rule and exclude our imports
    const fileLoaderRule = config.module.rules.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rule: any) => rule.test?.test?.(".svg"),
    );
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }
    config.module.rules.push(
      // SVG imported with ?url keeps the old behaviour (plain URL string)
      { ...fileLoaderRule, test: /\.svg$/i, resourceQuery: /url/ },
      // All other SVG imports become React components via SVGR
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ },
        use: ["@svgr/webpack"],
      },
    );
    return config;
  },
};

export default nextConfig;
