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

interface StyledTitleProps {
  text: string;
  color?: string;
  mode?: string;
}

export function StyledTitle({ text, color = "orange", mode = "light" }: StyledTitleProps): React.ReactElement {
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
            style={{
              '--stroke-color': color === "blue" ? 'var(--color-mx-blue)' : 'var(--color-mx-orange)',
              ...(mode === "dark" ? { WebkitTextFillColor: 'transparent' } : {}),
            } as React.CSSProperties}
          >{content}</span>
        ) : (
          content
        )}
      </React.Fragment>
    );
    lineIndex++;
  }

  return <>{result}</>;
}

/**
 * Renders title text with colored text applied to parts wrapped in `{}`.
 * Each `{...}` block is colored (orange/blue) and rendered on a new line.
 *
 * Example: "TRANSFORMA {TU FUTURO}"
 *  → "TRANSFORMA" (white)
 *  → "TU FUTURO" (orange, new line)
 */

interface ColoredTitleProps {
  text: string;
  color?: "orange" | "blue";
}

export function ColoredTitle({ text, color = "orange" }: ColoredTitleProps): React.ReactElement {
  // Split by {content} keeping the delimiters
  const segments = text.split(/(\{[^}]+\})/);
  const result: React.ReactNode[] = [];
  let lineIndex = 0;

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    const isColored = trimmed.startsWith('{') && trimmed.endsWith('}');
    const content = isColored ? trimmed.slice(1, -1) : trimmed;

    result.push(
      <React.Fragment key={lineIndex}>
        {lineIndex > 0 && <br />}
        {isColored ? (
          <span className={color === "blue" ? "text-mx-blue" : "text-amber-500"}>
            {content}
          </span>
        ) : (
          content
        )}
      </React.Fragment>
    );
    lineIndex++;
  }

  return <>{result}</>;
}
