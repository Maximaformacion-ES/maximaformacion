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
  /Googlebot|Google-InspectionTool|Google-Read-Aloud|Google-Site-Verification|Google-Other|Storebot-Google|Mediapartners-Google|AdsBot-Google|Bingbot|BingPreview|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Pinterestbot|Discordbot|WhatsApp|TelegramBot|Applebot|AhrefsBot|SemrushBot|MJ12bot|DotBot|Screaming Frog|GPTBot|ChatGPT-User|OAI-SearchBot|anthropic-ai|Claude-Web|ClaudeBot|PerplexityBot|Bytespider|Amazonbot/i;

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

// Routes that call auth() server-side (page layouts or route handlers) and
// would 500 on a bot request whose Clerk middleware wrapper was bypassed —
// auth() reads context that only the wrapper sets up. For these the bot
// branch returns 404 directly. They're also disallowed in robots.txt so
// well-behaved crawlers won't reach them.
const isAuthRequiredRoute = createRouteMatcher([
  '/maxymia/campus/(.*)',
  '/maxymia/campus',
  '/perfil(.*)',
  '/api/checkout(.*)',
  '/api/billing-portal(.*)',
  '/api/progress(.*)',
  '/api/stream(.*)',
  '/api/user(.*)',
  '/api/maxymia/(.*)',
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
      if (rule.statusCode === 410) {
        // Page is gone for good — tell search engines to drop it.
        return new NextResponse(null, {
          status: 410,
          headers: { 'X-Robots-Tag': 'noindex' },
        });
      }
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

// Stamp a noindex header on any response served from a *.vercel.app host.
// Vercel marks the project alias (maximaformacion.vercel.app) as
// VERCEL_ENV=production before custom DNS is cut over, so noindex-by-env
// alone leaves the preview URL crawlable. Doing it at the edge means it
// covers every response — pages, redirects, and the bot 404 branch.
function applyVercelHostNoindex(req: NextRequest, res: NextResponse): NextResponse {
  const host = req.headers.get("host") ?? "";
  if (host.endsWith(".vercel.app")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return res;
}

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (isBot(req)) {
    const pathname = req.nextUrl.pathname;

    // Bots still need to honour CMS-managed 301/302 redirects so ranking
    // signals consolidate properly on moved URLs.
    if (!shouldSkipRedirectLookup(pathname)) {
      const rule = await lookupRedirect(pathname);
      if (rule) {
        if (rule.statusCode === 410) {
          return applyVercelHostNoindex(
            req,
            new NextResponse(null, {
              status: 410,
              headers: { 'X-Robots-Tag': 'noindex' },
            })
          );
        }
        const dest = rule.destination.startsWith("http")
          ? new URL(rule.destination)
          : new URL(rule.destination, req.url);
        return applyVercelHostNoindex(req, NextResponse.redirect(dest, rule.statusCode));
      }
    }

    // Bots that ignore robots.txt and try to enter authenticated areas:
    // short-circuit with a 404 rather than rendering the page (which would
    // call auth() without the Clerk context the wrapper sets up and 500).
    if (isAuthRequiredRoute(req)) {
      return applyVercelHostNoindex(req, new NextResponse(null, { status: 404 }));
    }

    return applyVercelHostNoindex(req, NextResponse.next());
  }
  const response = await handleClerk(req, event);
  // handleClerk may return undefined when it lets the request pass through;
  // in that case we still want the noindex header for vercel.app hosts.
  if (response instanceof NextResponse) {
    return applyVercelHostNoindex(req, response);
  }
  const passthrough = NextResponse.next();
  return applyVercelHostNoindex(req, passthrough);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|otf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
