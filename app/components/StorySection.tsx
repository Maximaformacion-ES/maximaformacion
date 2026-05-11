'use client';

import React from 'react';

export const StorySection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 xl:py-48 px-4 md:px-6 xl:px-12 max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-14 xl:gap-20">
      <div className="text-center xl:text-left">
        <span className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg leading-label tracking-[0.2em] md:tracking-[0.3em] uppercase mb-4 block">NUESTRA HISTORIA</span>
        <h2 className="text-mx-blue text-heading-sm md:text-heading-md xl:text-heading-lg font-bold mb-6 md:mb-8 leading-heading text-balance">
          "No se trata de llegar alto, se trata de llegar lejos."
        </h2>
      </div>
      <div className="space-y-4 md:space-y-6 text-body-sm md:text-body-md text-mx-text-muted font-light leading-body text-center xl:text-left">
        <p>
          Máxima Formación nace con un propósito claro: democratizar la formación superior online de alta calidad, especializada y con un enfoque humano y cercano.
        </p>
        <p>
          Nuestro nombre no es casual. Buscamos la <strong className="text-mx-text">máxima</strong> excelencia en nuestros programas, la <strong className="text-mx-text">máxima</strong> atención a nuestros alumnos y el <strong className="text-mx-text">máximo</strong> impacto en sus carreras profesionales.
        </p>
        <div className="pt-6 md:pt-8 grid grid-cols-2 gap-4 md:gap-8 border-t border-mx-border">
          <div>
            <span className="text-mx-orange text-heading-sm md:text-heading-md xl:text-heading-lg font-bold block">15+</span>
            <span className="text-label-sm md:text-label-md leading-label text-mx-text-muted uppercase tracking-widest">Años de experiencia</span>
          </div>
          <div>
            <span className="text-mx-orange text-heading-sm md:text-heading-md xl:text-heading-lg font-bold block">40k+</span>
            <span className="text-label-sm md:text-label-md leading-label text-mx-text-muted uppercase tracking-widest">Alumnos formados</span>
          </div>
        </div>
      </div>
    </section>
  );
};
