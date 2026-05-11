import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { lookupRedirect } from "@/lib/seo/redirects";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/conocenos(.*)',
  '/programas(.*)',
  '/cursos(.*)',  // Course pages - access control handled by CourseAccessGate component
  '/consultoria(.*)',
  '/innovacion(.*)',
  '/blog(.*)',
  '/contacto(.*)',
  '/pricing(.*)',
  '/maxymia(.*)',
  '/verificar(.*)',
  '/recursos(.*)',
  '/api/leads(.*)',
  '/politica-de-privacidad(.*)',
  '/aviso-legal(.*)',
  '/politica-de-cookies(.*)',
  '/profesorado(.*)',
  '/autores(.*)',
  '/sitemap-autores.xml',
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap-pages.xml',
  '/sitemap-cursos.xml',
  '/sitemap-blog.xml',
  '/sitemap-recursos.xml',
  '/sitemap-profesorado.xml',
]);

// Define routes that should bypass Clerk auth (they use their own verification)
const isWebhookRoute = createRouteMatcher([
  '/api/webhooks/stripe(.*)',
  '/api/preview(.*)',
]);

// API/_next paths that should never go through the CMS-redirect lookup —
// would be wasted Strapi calls. Anything under these prefixes is skipped.
function shouldSkipRedirectLookup(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname === '/robots.txt' ||
    pathname.endsWith('.xml') ||
    pathname.includes('.')  // anything with a file extension
  );
}

export default clerkMiddleware(async (auth, req) => {
  // Skip authentication for webhook routes (they use Stripe signature verification)
  if (isWebhookRoute(req)) {
    return;
  }

  // CMS-managed redirects (301/302 rules from Strapi) — checked before auth.
  // Cached in-memory with TTL so this is cheap; degrades silently if Strapi
  // is unreachable.
  const pathname = req.nextUrl.pathname;
  if (!shouldSkipRedirectLookup(pathname)) {
    const rule = await lookupRedirect(pathname);
    if (rule) {
      const dest = rule.destination.startsWith('http')
        ? new URL(rule.destination)
        : new URL(rule.destination, req.url);
      return NextResponse.redirect(dest, rule.statusCode);
    }
  }

  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|otf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
