import type { NextConfig } from "next";

const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
const strapiParsed = new URL(strapiUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Strapi (dynamic from STRAPI_URL env)
      {
        protocol: strapiParsed.protocol.replace(':', '') as 'http' | 'https',
        hostname: strapiParsed.hostname,
        ...(strapiParsed.port && { port: strapiParsed.port }),
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
