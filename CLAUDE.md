# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Máxima Formación is a Next.js 16 educational platform offering courses, masters programs, consulting services, and innovation solutions. The design follows a cinematic noir aesthetic with dark backgrounds (#0a0a0a) and amber accents (#f59e0b).

## Commands

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Production build
npm start         # Start production server
npm run lint      # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19, TypeScript 5
- **CMS**: Strapi 5 (headless CMS with PostgreSQL)
- **Styling**: Tailwind CSS 4, Framer Motion for animations
- **Auth**: Clerk (@clerk/nextjs) with Spanish localization
- **Payments**: Stripe (subscriptions)
- **Icons**: Lucide React

## Architecture

### Data Layer
Data is managed through:
- **Strapi CMS** (`/cms`) - Programs and Blog Posts (PostgreSQL + optional Cloudflare R2 for media)
- **Fallback data files** (`app/data/programs.ts`, `app/data/blogs.ts`) - Used when Strapi is unavailable
- **Clerk user metadata** stores subscription status (`plan: 'free' | 'pro'`, `stripeCustomerId`, etc.)
- **Stripe** manages actual subscription billing

### Strapi CMS
```bash
# Start Strapi with Docker
docker-compose up -d

# Access Strapi admin
http://localhost:1337/admin
```

**Content Types:**
- `Program` - Courses and Masters (title, type, modules, isPro, etc.)
- `BlogPost` - Blog articles (title, content, author component, etc.)

**API Client:** `lib/strapi/` contains type-safe client for fetching content

### Authentication Flow
- Clerk middleware in `middleware.ts` protects routes
- Public routes defined via `createRouteMatcher`
- Webhook routes (`/api/webhooks/*`) bypass auth protection
- User subscription data stored in `user.publicMetadata`

### Payment Flow
```
/pricing → POST /api/checkout → Stripe Checkout → Stripe webhook → Update Clerk metadata
```

**API Routes:**
- `POST /api/checkout` - Creates Stripe checkout session (requires auth)
- `POST /api/webhooks/stripe` - Receives Stripe events, updates Clerk user metadata
- `POST /api/billing-portal` - Opens Stripe billing portal

### Dynamic Routes (Next.js 16 Pattern)
```tsx
interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}
export default function Page({ params }: PageProps) {
  const resolvedParams = use(params instanceof Promise ? params : Promise.resolve(params));
  // ...
}
```

## Design System

### Page Structure
Every page follows this pattern:
```tsx
'use client';
<div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
  <FontStyles />
  <div className="grain" />
  <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
  <main className="relative z-10">{/* sections */}</main>
  <Footer />
</div>
```

### Animation Pattern
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
>
```

### Styling Conventions
- Section padding: `py-32 px-6 md:px-12`
- Container: `max-w-7xl mx-auto` or `max-w-[1400px]`
- Card hover: `border border-white/10 hover:border-amber-500/50`
- Labels: `text-amber-500 text-sm tracking-[0.5em] uppercase`

### Custom CSS Classes (globals.css)
- `.grain` - Film grain overlay effect
- `.text-stroke` - Outlined text for headings
- `.no-scrollbar` - Hide scrollbar in overflow areas

## Pro Content Gating

```tsx
const userHasPro = isSignedIn && user?.publicMetadata?.plan === 'pro';
if (program.isPro && !userHasPro) {
  return <ProUpgradeGate />;
}
```

## Environment Variables

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in

# Stripe
STRIPE_SECRET_KEY
STRIPE_PRO_MONTHLY_PRICE_ID
STRIPE_PRO_YEARLY_PRICE_ID
STRIPE_WEBHOOK_SECRET

# App
NEXT_PUBLIC_APP_URL

# Strapi CMS
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN              # Generated in Strapi Admin > Settings > API Tokens
STRAPI_PREVIEW_SECRET         # For preview mode
```

## External Services

| Service | URL |
|---------|-----|
| Campus E-Learning | https://maximaformacion.com.es/ |
| Campus Data Science | https://www.maximacampus.es/ |
| Maxymia | https://maxymia.com/ |
