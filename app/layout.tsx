import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import { getSiteMetadata, getPrograms } from "@/lib/strapi/queries";
import { fetchMaxymiaCourses } from "./maxymia/data/queries";
import { maxymiaCourseAsProgram } from "./maxymia/data/adapters";
import type { MaxymiaCourse } from "./maxymia/types";
import { MotionProvider } from "./components/MotionProvider";
import { Analytics } from "./components/Analytics";
import { SiteBrandingProvider } from "./components/SiteBrandingProvider";
import { MegaMenuProvider, type MegaMenuArea } from "./components/MegaMenuProvider";
import { SUBJECT_AREAS } from "@/lib/subject-areas";
import { JsonLd } from "./components/JsonLd";
import { organizationSchema, websiteSchema, SITE_URL } from "@/lib/seo/jsonld";
import "./globals.css";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GTM_AUTH = process.env.NEXT_PUBLIC_GTM_AUTH;
const GTM_PREVIEW = process.env.NEXT_PUBLIC_GTM_PREVIEW;
// Nota: antes convivía un segundo contenedor GTM (GTM_ID_2). Se retiró para dejar
// un único contenedor (consolidación WPO: dos contenedores en paralelo sumaban
// ~600 KB de JS). La variable NEXT_PUBLIC_GTM_ID_2 puede borrarse de Vercel.
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

// Inter para texto de cuerpo/párrafo de las fichas de producto (el display y los
// rótulos siguen en ZT Nature). Se expone como variable y como token Tailwind
// `font-inter` (ver globals.css); ZT Nature se mantiene como fuente por defecto.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const siteMetadata = await getSiteMetadata();
  // Noindex policy at the layout level:
  //   - any non-production VERCEL_ENV (preview, development),
  //   - or an explicit `noIndex` flag in the Strapi site metadata.
  //
  // The *.vercel.app alias is handled at the edge by proxy.ts which
  // stamps X-Robots-Tag: noindex on every response from that host.
  // Reading the request headers here would force every page into
  // dynamic rendering even though almost nothing on layout depends on
  // the request, so we keep this metadata static-rendering-friendly
  // and let the middleware own host-based noindex.
  const isProduction = process.env.VERCEL_ENV === 'production';
  const noIndex = !isProduction || siteMetadata?.noIndex === true;

  // metadataBase tells Next.js how to resolve any relative URLs that
  // child pages use in their own metadata (alternates.canonical, og.url,
  // etc.). Without this every page would have to repeat the absolute URL.
  const metadataBase = new URL(SITE_URL);

  if (!siteMetadata) {
    return {
      metadataBase,
      title: "Máxima Formación — Cursos y másters en datos, IA, estadística y salud",
      description: "Lleva tu carrera al siguiente nivel con nuestra formación especializada. Másters, cursos y programas ejecutivos de élite.",
      alternates: { canonical: '/' },
      robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    };
  }

  return {
    metadataBase,
    title: siteMetadata.metaTitle,
    description: siteMetadata.metaDescription,
    keywords: siteMetadata.keywords,
    alternates: {
      canonical: siteMetadata.canonicalUrl ?? '/',
    },
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
  const [siteMetadata, programsResult, maxymiaCourses] = await Promise.all([
    getSiteMetadata(),
    getPrograms({ limit: 200 }).catch(() => ({ programs: [], total: 0, pageCount: 0 })),
    fetchMaxymiaCourses().catch(() => [] as MaxymiaCourse[]),
  ]);
  const branding = {
    logoMaximaformacion: siteMetadata?.logoMaximaformacion || '',
    // El logo de Maxymia se sirve como asset estático (versión blanca, para las
    // cabeceras/footer oscuros de Maxymia). El campo `logoMaxymia` del Site
    // Metadata de Strapi apunta por error al logo de Máxima (logo_completo).
    logoMaxymia: '/logo_maxymia_blanco_sin_fondo.png',
  };

  // Group programs by subjectArea for the desktop megamenu. Ordering and
  // labels come from the shared SUBJECT_AREAS table so /programas/area/[slug]
  // landings and the header stay in sync. Maxymia courses are merged in the
  // same way /programas does it — they carry the "Inteligencia Artificial"
  // area (and link to /maxymia/campus/[slug] via their href), so without this
  // merge the IA column would always be empty and get filtered out.
  const mergedPrograms = [
    ...programsResult.programs,
    ...maxymiaCourses.map(maxymiaCourseAsProgram),
  ];
  const grouped = new Map<string, { title: string; slug: string; href: string }[]>();
  for (const p of mergedPrograms) {
    if (!p.subjectArea || !p.slug) continue;
    if (!grouped.has(p.subjectArea)) grouped.set(p.subjectArea, []);
    grouped.get(p.subjectArea)!.push({
      title: p.title,
      slug: p.slug,
      href: p.href ?? `/programas/${p.slug}`,
    });
  }
  const megaMenuAreas: MegaMenuArea[] = SUBJECT_AREAS.map((a) => ({
    key: a.key,
    label: a.label,
    slug: a.slug,
    programs: (grouped.get(a.key) ?? []).sort((x, y) => x.title.localeCompare(y.title, 'es')),
  }));

  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <head>
          {/* Preconnect a los orígenes REALES de la primera carga: Clerk de
              producción (sirve clerk.browser.js) y el bucket R2 de imágenes (logos,
              sellos, hero). Antes apuntaba a un dominio DEV de Clerk
              (good-bengal-30.clerk.accounts.dev) que en prod no se usa → PSI avisaba
              de que no se establecía conexión. */}
          <link rel="preconnect" href="https://clerk.maximaformacion.es" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://pub-a3cc095f320346dca3aa9ded3eab6141.r2.dev" crossOrigin="anonymous" />
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
          className={`${ztNature.variable} ${inter.variable} antialiased`}
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
            <MegaMenuProvider value={{ areas: megaMenuAreas }}>
              <MotionProvider>{children}</MotionProvider>
            </MegaMenuProvider>
          </SiteBrandingProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
