'use client';

import React from 'react';

export const StorySection: React.FC = () => {
  return (
    <section className="py-48 px-6 md:px-12 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
      <div>
        <span className="text-mx-orange text-sm tracking-[0.3em] uppercase mb-4 block">NUESTRA HISTORIA</span>
        <h2 className="text-mx-blue text-4xl md:text-5xl font-bold mb-8 leading-tight">
          "No se trata de llegar alto, se trata de llegar lejos."
        </h2>
      </div>
      <div className="space-y-6 text-lg text-mx-text-muted font-light leading-relaxed">
        <p>
          Máxima Formación nace con un propósito claro: democratizar la formación superior online de alta calidad, especializada y con un enfoque humano y cercano.
        </p>
        <p>
          Nuestro nombre no es casual. Buscamos la <strong className="text-mx-text">máxima</strong> excelencia en nuestros programas, la <strong className="text-mx-text">máxima</strong> atención a nuestros alumnos y el <strong className="text-mx-text">máximo</strong> impacto en sus carreras profesionales.
        </p>
        <div className="pt-8 grid grid-cols-2 gap-8 border-t border-mx-border">
          <div>
            <span className="text-mx-orange text-3xl font-bold block">15+</span>
            <span className="text-xs text-mx-text-muted uppercase tracking-widest">Años de experiencia</span>
          </div>
          <div>
            <span className="text-mx-orange text-3xl font-bold block">10k+</span>
            <span className="text-xs text-mx-text-muted uppercase tracking-widest">Alumnos formados</span>
          </div>
        </div>
      </div>
    </section>
  );
};
