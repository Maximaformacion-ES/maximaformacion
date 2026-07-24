import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
const strapiParsed = new URL(strapiUrl);

// Enable with `ANALYZE=true pnpm build`. Writes the report under
// .next/analyze/client.html and server.html.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

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
      // Dominio propio del bucket R2 (cacheado en edge). Sustituye a pub-*.r2.dev.
      {
        protocol: 'https',
        hostname: 'cdn.maximaformacion.es',
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
      // Clerk user avatars
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      // Cloudflare Stream thumbnails
      {
        protocol: 'https',
        hostname: '*.cloudflarestream.com',
      },
      {
        protocol: 'https',
        hostname: 'videodelivery.net',
      },
    ],
  },
  // Redirects para URLs legacy de páginas legales (mantener compatibilidad
  // con cualquier link externo / cache que apunte a los slugs antiguos).
  async redirects() {
    return [
      { source: '/privacidad', destination: '/politica-de-privacidad', permanent: true },
      { source: '/terminos', destination: '/aviso-legal', permanent: true },
      { source: '/cookies', destination: '/politica-de-cookies', permanent: true },
    ];
  },
  // Headers para mejorar caché + noindex en entornos preview/desarrollo.
  async headers() {
    const isProduction = process.env.VERCEL_ENV === 'production';
    const noindexHeader = !isProduction
      ? [
          {
            source: '/:path*',
            headers: [
              { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
            ],
          },
        ]
      : [];

    return [
      ...noindexHeader,
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

export default withBundleAnalyzer(nextConfig);
