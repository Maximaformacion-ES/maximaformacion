'use client';

import React, { useState } from 'react';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FAQSection } from '../components/FAQSection';
import ConsultaGratuitaChooser from '../components/ConsultaGratuitaChooser';
import FloatingConsultCTA from '../components/FloatingConsultCTA';
import {
  HeroConsultoria,
  ProblemSection,
  ServicesSection,
  StudyTypesSection,
  ProcessSection,
  DeliverablesSection,
  BenefitsSection,
  UseCasesSection,
  FreeConsultHighlight,
} from '../components/ConsultoriaPage/sections';

const CONSULTORIA_FAQS = [
  {
    question: '¿Solo trabajáis con estudios bioestadísticos?',
    answer:
      'Nuestra especialidad es la bioestadística, especialmente en salud, biomedicina y ciencias de la vida. No obstante, también podemos analizar datos de otros ámbitos como educación, empresa, encuestas, marketing, investigación social o proyectos internos. Si tienes datos y una pregunta que responder, consúltanos.',
  },
  {
    question: '¿Podéis ayudarme si todavía no he recogido los datos?',
    answer:
      'Sí. De hecho, es recomendable contar con asesoramiento estadístico antes de recoger los datos. Podemos ayudarte con el diseño del estudio, la definición de variables, el tamaño muestral y la planificación del análisis.',
  },
  {
    question: '¿Podéis analizar datos para una tesis, TFG o TFM?',
    answer:
      'Sí. Podemos ayudarte a plantear el análisis, preparar tablas y gráficos, interpretar resultados y generar material útil para tu trabajo académico.',
  },
  {
    question: '¿Entregáis solo los resultados o también la interpretación?',
    answer:
      'Nuestro objetivo es que entiendas los resultados. Por eso, además de tablas o gráficos, podemos incluir una explicación clara de la metodología utilizada y de la interpretación de los resultados.',
  },
  {
    question: '¿Puedo consultar aunque no sepa qué análisis necesito?',
    answer:
      'Sí. La consulta gratuita está pensada precisamente para que nos cuentes tu situación y podamos orientarte sobre el análisis más adecuado.',
  },
  {
    question: '¿Qué necesito enviar para pedir una consulta?',
    answer:
      'Basta con una breve descripción del estudio, tus objetivos, el tipo de datos que tienes o vas a recoger y qué necesitas obtener. Si ya tienes base de datos, puedes indicarlo en el formulario.',
  },
  {
    question: '¿Tratáis los datos con confidencialidad?',
    answer:
      'Sí. La confidencialidad y el uso responsable de la información son parte fundamental del servicio.',
  },
  {
    question: '¿Podéis ayudarme con artículos científicos?',
    answer:
      'Sí. Podemos preparar análisis, tablas, gráficos, interpretación de resultados y apoyo metodológico para artículos científicos, comunicaciones o informes de investigación.',
  },
];

export default function ConsultoriaClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Every "Consulta gratuita" CTA on this page opens the shared chooser so
  // visitors can pick between filling the form or scheduling a call directly,
  // matching the floating CTA's behaviour. Previously these PrimaryCTAs
  // jumped straight to the form modal and skipped the scheduling option.
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const openForm = () => setIsChooserOpen(true);

  return (
    <div className="theme-consultoria bg-mx-bg min-h-screen text-mx-text selection:bg-mx-orange/30 overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        <HeroConsultoria onOpenForm={openForm} />
        <ProblemSection onOpenForm={openForm} />
        <ServicesSection onOpenForm={openForm} />
        <StudyTypesSection onOpenForm={openForm} />
        <ProcessSection onOpenForm={openForm} />
        <DeliverablesSection onOpenForm={openForm} />
        <BenefitsSection />
        <UseCasesSection onOpenForm={openForm} />
        <FreeConsultHighlight onOpenForm={openForm} />
        <FAQSection
          overline="Resolvemos tus dudas"
          title="PREGUNTAS {FRECUENTES}"
          faqs={CONSULTORIA_FAQS}
        />
      </main>

      <FloatingConsultCTA />
      <Footer />

      <ConsultaGratuitaChooser open={isChooserOpen} onClose={() => setIsChooserOpen(false)} />
    </div>
  );
}
