import React from 'react';

/**
 * Embeds a JSON-LD structured-data block into the HTML response.
 * Server component — content is part of the initial HTML (Google reads it
 * without executing JS).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  // Each <script type="application/ld+json"> must contain exactly one JSON
  // value. Concatenating multiple objects in one tag produces invalid JSON
  // and crawlers (Google's Rich Results Test included) drop everything past
  // the first object — that's why e.g. BreadcrumbList wasn't being detected
  // when paired with Course/BlogPosting/Person.
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
