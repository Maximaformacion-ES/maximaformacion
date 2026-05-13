import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import { getSiteMetadata } from "@/lib/strapi/queries";
import { MotionProvider } from "./components/MotionProvider";
import { Analytics } from "./components/Analytics";
import { SiteBrandingProvider } from "./components/SiteBrandingProvider";
import { JsonLd } from "./components/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo/jsonld";
import "./globals.css";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GTM_AUTH = process.env.NEXT_PUBLIC_GTM_AUTH;
const GTM_PREVIEW = process.env.NEXT_PUBLIC_GTM_PREVIEW;
const COOKIEBOT_ID = process.env.NEXT_PUBLIC_COOKIEBOT_ID;

const ztNature = localFont({
  src: [
    { path: "../public/fonts/ZTNature-Thin.otf", weight: "100", style: "normal" },
    { path: "../public/fonts/ZTNature-ThinItalic.otf", weight: "100", style: "italic" },
    { path: "../public/fonts/ZTNature-Light.otf", weight: "300", style: "normal" },
    { path: "../public/fonts/ZTNature-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/ZTNature-Medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/ZTNature-Bold.otf", weight: "700", style: "normal" },
    { path: "../public/fonts/ZTNature-Black.otf", weight: "900", style: "normal" },
    { path: "../public/fonts/ZTNature-BlackItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-zt-nature",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const siteMetadata = await getSiteMetadata();
  // En previews y desarrollo (Vercel preview, vercel.app, local) → noindex global.
  // Solo dejamos indexar cuando VERCEL_ENV === 'production'.
  const isProduction = process.env.VERCEL_ENV === 'production';
  const noIndex = !isProduction || siteMetadata?.noIndex === true;

  if (!siteMetadata) {
    return {
      title: "Maximaformación - Formación Profesional experta",
      description: "Lleva tu carrera al siguiente nivel con nuestra formación especializada. Másters, cursos y programas ejecutivos de élite.",
      robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    };
  }

  return {
    title: siteMetadata.metaTitle,
    description: siteMetadata.metaDescription,
    keywords: siteMetadata.keywords,
    ...(siteMetadata.canonicalUrl && {
      alternates: { canonical: siteMetadata.canonicalUrl },
    }),
    ...(siteMetadata.favicon && {
      icons: {
        icon: siteMetadata.favicon,
        shortcut: siteMetadata.favicon,
        apple: siteMetadata.favicon,
      },
    }),
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: siteMetadata.ogTitle,
      description: siteMetadata.ogDescription,
      ...(siteMetadata.ogImage && { images: [siteMetadata.ogImage] }),
      type: siteMetadata.ogType as "website" | "article" | "profile",
      siteName: siteMetadata.metaTitle,
      ...(siteMetadata.canonicalUrl && { url: siteMetadata.canonicalUrl }),
    },
    twitter: {
      card: siteMetadata.twitterCard as "summary" | "summary_large_image",
      title: siteMetadata.ogTitle,
      description: siteMetadata.ogDescription,
      ...(siteMetadata.ogImage && { images: [siteMetadata.ogImage] }),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteMetadata = await getSiteMetadata();
  const branding = {
    logoMaximaformacion: siteMetadata?.logoMaximaformacion || '',
    logoMaxymia: siteMetadata?.logoMaxymia || '',
  };

  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <head>
          <link rel="preconnect" href="https://good-bengal-30.clerk.accounts.dev" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://clerk-telemetry.com" crossOrigin="anonymous" />
          <JsonLd data={[organizationSchema(), websiteSchema()]} />
          {/* Safety net for Framer Motion's SSR-emitted opacity:0 — if
              hydration hasn't completed within 2.5s (slow headless renderers,
              crawler WRS taking screenshots before hydration), force every
              element still at opacity:0 to be visible. Real-user hydration
              completes in ~100-300ms so this never fires for them. Inline
              <script> placed in <head> so it parses before the body renders. */}
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `setTimeout(function(){try{document.querySelectorAll('[style*="opacity:0"],[style*="opacity: 0"]').forEach(function(el){el.style.opacity='1';el.style.transform='none'})}catch(e){}},2500);`,
            }}
          />
        </head>
        <body
          className={`${ztNature.variable} antialiased`}
          style={{ fontFamily: "var(--font-zt-nature), system-ui, sans-serif" }}
        >
          {COOKIEBOT_ID && (
            <>
              <Script id="consent-mode-default" strategy="afterInteractive">
                {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted',
  'wait_for_update': 500
});`}
              </Script>
              <Script
                id="Cookiebot"
                src="https://consent.cookiebot.com/uc.js"
                data-cbid={COOKIEBOT_ID}
                data-blockingmode="auto"
                data-culture="ES"
                strategy="afterInteractive"
              />
            </>
          )}
          {GTM_ID && (
            <GoogleTagManager
              gtmId={GTM_ID}
              auth={GTM_AUTH}
              preview={GTM_PREVIEW}
            />
          )}
          {GTM_ID && <Analytics />}
          <SiteBrandingProvider value={branding}>
            <MotionProvider>{children}</MotionProvider>
          </SiteBrandingProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
