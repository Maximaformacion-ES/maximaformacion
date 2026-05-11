"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSiteBranding } from "./SiteBrandingProvider";

export const Footer: React.FC = () => {
  const branding = useSiteBranding();
  const pathname = usePathname();
  const isMaxymia = pathname?.startsWith("/maxymia") ?? false;
  const logoSrc = isMaxymia ? branding.logoMaxymia : branding.logoMaximaformacion;
  const logoAlt = isMaxymia ? "Maxymia" : "Máxima Formación";
  const homeHref = isMaxymia ? "/maxymia" : "/";
  const footerLinks = {
    Formación: [
      { label: "Programas", href: "/programas" },
      { label: "Pricing", href: "/pricing" },
      { label: "Maxymia", href: "/maxymia" },
    ],
    Servicios: [
      { label: "Consultoría", href: "/consultoria" },
      { label: "Innovación", href: "/innovacion" },
    ],
    Empresa: [
      { label: "Conócenos", href: "/conocenos" },
      { label: "Profesorado", href: "/profesorado" },
      { label: "Autores", href: "/autores" },
      { label: "Blog", href: "/blog" },
      { label: "Contacto", href: "/contacto" },
    ],
  };

  return (
    <footer className="bg-mx-bg border-t border-mx-border/80 py-16 md:py-24">
      <div className="max-w-[1800px] mx-auto px-6 md:px-28">
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          {/* Brand */}
          <div className="lg:flex-1">
            <Link href={homeHref} className="inline-block">
              {logoSrc && (
                <Image
                  src={logoSrc}
                  alt={logoAlt}
                  width={200}
                  height={66}
                  className="h-10 md:h-12 w-auto"
                />
              )}
            </Link>
            <p className="text-mx-text-muted text-body-sm font-light mt-4 max-w-xs leading-relaxed">
              Formación profesional experta para impulsar tu carrera al
              siguiente nivel.
            </p>

            {/* Social links */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.linkedin.com/company/maximaformacion/?originalSubdomain=es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mx-text-muted hover:text-mx-orange transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/maximaformacion_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mx-text-muted hover:text-mx-orange transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/maximaelearning/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mx-text-muted hover:text-mx-orange transition-colors"
                aria-label="Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@maximaformacion"
                target="_blank"
                rel="noopener noreferrer"
                className="text-mx-text-muted hover:text-mx-orange transition-colors"
                aria-label="YouTube"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 lg:flex lg:flex-row lg:gap-28">
            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-mx-text font-bold mb-4">{category}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-mx-text-muted hover:text-mx-orange text-body-sm font-light transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-mx-text-muted text-body-sm">
            © 2026 Maximaformación. Todos los derechos reservados.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-body-sm">
            <li>
              <Link
                href="/aviso-legal"
                className="text-mx-text-muted hover:text-mx-orange transition-colors"
              >
                Aviso legal
              </Link>
            </li>
            <li aria-hidden className="text-mx-border">·</li>
            <li>
              <Link
                href="/politica-de-privacidad"
                className="text-mx-text-muted hover:text-mx-orange transition-colors"
              >
                Política de privacidad
              </Link>
            </li>
            <li aria-hidden className="text-mx-border">·</li>
            <li>
              <Link
                href="/politica-de-cookies"
                className="text-mx-text-muted hover:text-mx-orange transition-colors"
              >
                Política de cookies
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
