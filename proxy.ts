import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { lookupRedirect } from "@/lib/seo/redirects";

// Search-engine crawlers, link previewers, and SEO/AI agents. With Clerk
// development keys (pk_test_*) every request whose Accept advertises HTML
// gets a 307 to *.clerk.accounts.dev for the "dev-browser-missing"
// handshake — a redirect that crawlers cannot follow, which means
// Googlebot et al. can't index any page. Skipping Clerk's wrapper for
// these UAs lets crawlers see the same SSR HTML that real users get.
// Protected routes stay protected because /maxymia/campus/layout.tsx
// (and similar) redirect on null userId regardless of middleware. The
// guard is harmless once production keys land (Clerk stops doing the
// dev handshake), so it can stay as defence in depth.
const BOT_UA_RX =
  /Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Pinterestbot|Discordbot|WhatsApp|TelegramBot|Applebot|AhrefsBot|SemrushBot|MJ12bot|DotBot|Screaming Frog|GPTBot|ChatGPT-User|anthropic-ai|Claude-Web|PerplexityBot|Bytespider/i;

function isBot(req: NextRequest): boolean {
  const ua = req.headers.get("user-agent") ?? "";
  return BOT_UA_RX.test(ua);
}

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

const handleClerk = clerkMiddleware(async (auth, req) => {
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

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (isBot(req)) {
    const pathname = req.nextUrl.pathname;

    // Bots still need to honour CMS-managed 301/302 redirects so ranking
    // signals consolidate properly on moved URLs.
    if (!shouldSkipRedirectLookup(pathname)) {
      const rule = await lookupRedirect(pathname);
      if (rule) {
        const dest = rule.destination.startsWith("http")
          ? new URL(rule.destination)
          : new URL(rule.destination, req.url);
        return NextResponse.redirect(dest, rule.statusCode);
      }
    }

    // Bots that ignore robots.txt and try to enter authenticated areas:
    // short-circuit with a 404 rather than rendering the page (which would
    // call auth() without the Clerk context the wrapper sets up and 500).
    if (!isPublicRoute(req) && !isWebhookRoute(req)) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.next();
  }
  return handleClerk(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|otf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
