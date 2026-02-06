import React from 'react';

/**
 * Renders title text with `text-stroke` applied to parts wrapped in `{}`.
 * Each `{...}` block is rendered on a new line with the stroke effect.
 *
 * Example: "TRANSFORMA {TU FUTURO}"
 *  → "TRANSFORMA" (normal)
 *  → "TU FUTURO" (text-stroke, new line)
 *
 * Example: "TU PRÓXIMO {CAPÍTULO} EMPIEZA HOY"
 *  → "TU PRÓXIMO" (normal)
 *  → "CAPÍTULO" (text-stroke, new line)
 *  → "EMPIEZA HOY" (normal, new line)
 */
export function renderStyledTitle(text: string, color: string = "orange"): React.ReactNode[] {
  // Split by {content} keeping the delimiters
  const segments = text.split(/(\{[^}]+\})/);
  const result: React.ReactNode[] = [];
  let lineIndex = 0;

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    const isStroke = trimmed.startsWith('{') && trimmed.endsWith('}');
    const content = isStroke ? trimmed.slice(1, -1) : trimmed;

    result.push(
      <React.Fragment key={lineIndex}>
        {lineIndex > 0 && <br />}
        {isStroke ? (
          <span
            className="text-stroke"
            style={{ '--stroke-color': color === "blue" ? 'var(--color-mx-blue)' : 'var(--color-mx-orange)' } as React.CSSProperties}
          >{content}</span>
        ) : (
          content
        )}
      </React.Fragment>
    );
    lineIndex++;
  }

  return result;
}
