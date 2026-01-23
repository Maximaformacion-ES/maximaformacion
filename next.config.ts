import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Strapi local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      // Cloudflare R2
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      // Unsplash (used in existing data)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Pravatar (used for avatars)
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
};

export default nextConfig;
