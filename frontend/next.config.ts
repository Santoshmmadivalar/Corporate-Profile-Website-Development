import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: process.cwd(),
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': path.resolve(process.cwd(), 'node_modules/react'),
      'react-dom': path.resolve(process.cwd(), 'node_modules/react-dom'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      'react': './node_modules/react',
      'react-dom': './node_modules/react-dom',
    },
  },
};

export default nextConfig;
