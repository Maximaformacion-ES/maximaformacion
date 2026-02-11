import type { NextConfig } from "next";

const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
const strapiParsed = new URL(strapiUrl);

const nextConfig: NextConfig = {
  images: {
    // Formatos optimizados
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      // Strapi Cloud Media
      {
        protocol: 'https',
        hostname: '*.strapiapp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.media.strapiapp.com',
        pathname: '/**',
      },
      // Strapi (dynamic from STRAPI_URL env)
      {
        protocol: strapiParsed.protocol.replace(':', '') as 'http' | 'https',
        hostname: strapiParsed.hostname,
        ...(strapiParsed.port && { port: strapiParsed.port }),
        pathname: '/uploads/**',
      },
      // Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
      // Cloudflare R2
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      // Cloudflare R2 public bucket
      {
        protocol: 'https',
        hostname: '*.r2.dev',
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
  // Headers para mejorar caché
  async headers() {
    return [
      {
        // Caché largo para assets estáticos
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|otf|ttf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Caché para imágenes optimizadas de Next.js
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
