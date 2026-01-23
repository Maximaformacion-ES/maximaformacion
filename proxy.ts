import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
]);

// Define routes that should bypass Clerk auth (they use their own verification)
const isWebhookRoute = createRouteMatcher([
  '/api/webhooks/stripe(.*)',
  '/api/preview(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip authentication for webhook routes (they use Stripe signature verification)
  if (isWebhookRoute(req)) {
    return;
  }
  
  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
