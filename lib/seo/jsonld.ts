/**
 * JSON-LD builders for structured data (schema.org).
 *
 * Schemas se emiten desde los page.tsx vía un componente JsonLd que envuelve
 * el objeto en <script type="application/ld+json">. Como el page.tsx es server
 * component, el JSON-LD aparece en el HTML inicial → Google lo lee sin necesidad
 * de ejecutar JS.
 */

import type { Program, BlogPost } from '@/lib/strapi/types';

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://www.maximaformacion.es'
).replace(/\/$/, '');
const ORG_NAME = 'Máxima Formación';
const ORG_LEGAL_NAME = 'Máxima Formación, S.L.U.';
const ORG_LOGO = `${SITE_URL}/logo.png`;

/** Organization — para incluir en el layout raíz. Aparecerá en todas las páginas. */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}#organization`,
    name: ORG_NAME,
    legalName: ORG_LEGAL_NAME,
    url: SITE_URL,
    logo: ORG_LOGO,
    sameAs: [
      'https://www.linkedin.com/company/maximaformacion/',
      'https://www.instagram.com/maximaformacion_/',
      'https://www.facebook.com/maximaelearning/',
      'https://www.youtube.com/@maximaformacion',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'cursos@maximaformacion.es',
        telephone: '+34635659391',
        availableLanguage: ['Spanish'],
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Avenida Innovación 1, Edificio BIC',
      postalCode: '18016',
      addressLocality: 'Granada',
      addressCountry: 'ES',
    },
  };
}

/** WebSite — habilita el "sitelinks searchbox" en Google. Una vez por site. */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: ORG_NAME,
    publisher: { '@id': `${SITE_URL}#organization` },
    inLanguage: 'es-ES',
  };
}

/** Course — para /programas/[slug]. */
export function courseSchema(program: Program) {
  const programUrl = `${SITE_URL}/programas/${program.slug}`;
  const description = program.longDescription || program.description || program.title;
  const isFree = !program.price || program.price === 0;
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.title,
    description: description.slice(0, 500),
    url: programUrl,
    inLanguage: 'es-ES',
    provider: {
      '@type': 'EducationalOrganization',
      name: ORG_NAME,
      '@id': `${SITE_URL}#organization`,
      url: SITE_URL,
    },
    ...(program.image ? { image: program.image } : {}),
    educationalLevel: program.type === 'Master' ? 'Máster' : 'Curso',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      inLanguage: 'es-ES',
      ...(program.duration ? { courseWorkload: `PT${program.duration}H` } : {}),
    },
    offers: isFree
      ? {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: programUrl,
        }
      : {
          '@type': 'Offer',
          price: String(program.price),
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: programUrl,
        },
  };
}

/** Article / BlogPosting — para /blog/[slug]. */
export function blogPostSchema(post: BlogPost) {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    url: postUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    inLanguage: 'es-ES',
    ...(post.image ? { image: post.image } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.publishedAt ? { dateModified: post.publishedAt } : {}),
    author: post.author?.name
      ? {
          '@type': 'Person',
          name: post.author.name,
          ...(post.author.linkedin ? { sameAs: [post.author.linkedin] } : {}),
        }
      : { '@type': 'Organization', name: ORG_NAME, '@id': `${SITE_URL}#organization` },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      '@id': `${SITE_URL}#organization`,
      logo: { '@type': 'ImageObject', url: ORG_LOGO },
    },
    ...(post.tags && post.tags.length ? { keywords: post.tags.join(', ') } : {}),
  };
}

/** BreadcrumbList — útil en program/blog detail. */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE_URL}${it.url}`,
    })),
  };
}

/** FAQPage — para program detail y home FAQ. */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
