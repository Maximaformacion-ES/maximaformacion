import React from 'react';

/**
 * Embeds a JSON-LD structured-data block into the HTML response.
 * Server component — content is part of the initial HTML (Google reads it
 * without executing JS).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data)
    ? data.map((d) => JSON.stringify(d)).join('\n')
    : JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  );
}
