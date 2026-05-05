import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { GoogleTagManager } from "@next/third-parties/google";
import { getSiteMetadata } from "@/lib/strapi/queries";
import { MotionProvider } from "./components/MotionProvider";
import { Analytics } from "./components/Analytics";
import "./globals.css";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GTM_AUTH = process.env.NEXT_PUBLIC_GTM_AUTH;
const GTM_PREVIEW = process.env.NEXT_PUBLIC_GTM_PREVIEW;

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

  if (!siteMetadata) {
    return {
      title: "Maximaformación - Formación Profesional experta",
      description: "Lleva tu carrera al siguiente nivel con nuestra formación especializada. Másters, cursos y programas ejecutivos de élite.",
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
    robots: siteMetadata.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <head>
          <link rel="preconnect" href="https://good-bengal-30.clerk.accounts.dev" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://clerk-telemetry.com" crossOrigin="anonymous" />
        </head>
        {GTM_ID && (
          <GoogleTagManager
            gtmId={GTM_ID}
            auth={GTM_AUTH}
            preview={GTM_PREVIEW}
          />
        )}
        <body
          className={`${ztNature.variable} antialiased`}
          style={{ fontFamily: "var(--font-zt-nature), system-ui, sans-serif" }}
        >
          {GTM_ID && <Analytics />}
          <MotionProvider>{children}</MotionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
