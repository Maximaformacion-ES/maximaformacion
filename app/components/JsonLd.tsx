import React from 'react';

/**
 * Embeds a JSON-LD structured-data block into the HTML response.
 * Server component — content is part of the initial HTML (Google reads it
 * without executing JS).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  // Multiple related schemas are wrapped in @graph under a single @context
  // and emitted as one <script type="application/ld+json">. This is the
  // pattern Google recommends for connected entities (it also lets us link
  // items together by @id later without duplicating organization data
  // across every Course/BlogPosting/Person). Strip @context from individual
  // items so the outer wrapper is the single source of truth.
  const payload = Array.isArray(data)
    ? {
        '@context': 'https://schema.org',
        '@graph': data.map((d) => {
          const obj = d as Record<string, unknown>;
          if ('@context' in obj) {
            const { ['@context']: _, ...rest } = obj;
            return rest;
          }
          return obj;
        }),
      }
    : data;
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
