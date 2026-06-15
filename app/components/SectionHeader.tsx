import React from 'react';
import { StyledTitle } from './StyledTitle';

/**
 * Cabecera de sección de la ficha (Figma): overline naranja + título de dos
 * líneas (sólido azul + hueco/stroke azul) + descripción opcional.
 *
 * - Overline y título: ZT Nature (`font-sans`), el lenguaje de marca.
 * - Descripción: Inter (`font-body`), texto de cuerpo.
 *
 * El título usa la sintaxis `{}` de StyledTitle para la parte hueca, p. ej.
 * `title="Confían en {Nosotros}"` → "CONFÍAN EN" sólido + "NOSOTROS" hueco.
 */
export function SectionHeader({
  overline,
  title,
  description,
  align = 'left',
  className = '',
}: {
  overline: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  const centered = align === 'center';
  return (
    <div className={`flex flex-col gap-2.5 ${centered ? 'items-center text-center' : 'items-start'} ${className}`}>
      <span className="font-sans font-medium text-mx-orange text-[13px] md:text-[14px] tracking-[4px] uppercase leading-none">
        {overline}
      </span>
      <h2 className="font-sans font-black text-mx-blue text-[30px] md:text-[36px] tracking-tight uppercase leading-[1.15]">
        <StyledTitle text={title} color="blue" />
      </h2>
      {description && (
        <p className="font-body text-mx-text-muted text-[15px] md:text-[16px] leading-[1.3] max-w-[812px] mt-2">
          {description}
        </p>
      )}
    </div>
  );
}
