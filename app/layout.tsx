import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { getSiteMetadata } from "@/lib/strapi/queries";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
          <link rel="preload" href="/fonts/ZTNature-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
          <link rel="preload" href="/fonts/ZTNature-Bold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
          <link rel="preload" href="/fonts/ZTNature-Light.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
