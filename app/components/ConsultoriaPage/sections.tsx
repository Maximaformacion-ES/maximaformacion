'use client';

import React from 'react';
import { m } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Microscope,
  GraduationCap,
  ClipboardList,
  Building2,
  Database,
  HelpCircle,
  Target,
  FileBarChart,
  Calculator,
  Beaker,
  LineChart,
  Sparkles,
  ShieldCheck,
  Handshake,
  Layers,
  Lock,
  MessageCircle,
  CheckCheck,
} from 'lucide-react';
import { StyledTitle } from '../StyledTitle';
import ConsultoriaForm from '../ConsultoriaForm';

// ─── Shared primitives ──────────────────────────────────────────────────────

const SECTION_CLS = 'relative py-16 md:py-20 lg:py-24 px-6 md:px-12';
const CONTAINER_CLS = 'max-w-6xl mx-auto';
const OVERLINE_CLS =
  'text-mx-orange text-label-sm md:text-label-md tracking-[0.3em] uppercase font-medium';
const H2_CLS =
  'text-mx-blue text-heading-md md:text-heading-lg xl:text-display-sm font-black leading-display tracking-display text-balance max-w-4xl';
const SUBTITLE_CLS =
  'text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light leading-body max-w-3xl text-balance';

function PrimaryCTA({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-3 bg-mx-orange text-white px-7 py-3.5 md:px-8 md:py-4 text-label-sm md:text-label-md font-medium rounded-full hover:bg-mx-orange-dark transition-colors duration-300 hover:cursor-pointer"
    >
      {children}
      <ArrowRight
        size={18}
        className="group-hover:translate-x-1 transition-transform"
      />
    </button>
  );
}

function SecondaryCTA({
  href,
  onClick,
  children,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const className =
    'inline-flex items-center gap-2 border border-mx-blue text-mx-blue px-7 py-3.5 md:px-8 md:py-4 text-label-sm md:text-label-md font-medium rounded-full hover:bg-mx-blue hover:text-white transition-colors duration-300';
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} hover:cursor-pointer`}>
        {children}
      </button>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

interface SectionProps {
  onOpenForm: () => void;
}

// ─── 1. Hero ────────────────────────────────────────────────────────────────

const HERO_CHIPS = [
  'Bioestadística',
  'Tesis',
  'Artículos científicos',
  'Estudios sanitarios',
  'Empresas',
  'Encuestas',
  'Datos educativos',
  'Datos sociales',
];

export function HeroConsultoria({ onOpenForm }: SectionProps) {
  return (
    <section className="relative pt-28 pb-12 md:pt-36 md:pb-20 px-6 md:px-12 overflow-hidden">
      {/* Decorative grid background */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #e5e5e5 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(82,123,231,0.08),transparent_55%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,rgba(247,160,0,0.05),transparent_55%)] pointer-events-none" />

      <div className={`${CONTAINER_CLS} relative`}>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          {/* Left: text + CTAs */}
          <div>
            <m.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`inline-block ${OVERLINE_CLS} mb-5`}
            >
              Consultoría bioestadística y análisis de datos
            </m.span>

            <m.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-mx-blue text-heading-lg md:text-display-sm xl:text-display-md font-black leading-display tracking-display mb-6 text-balance"
            >
              <StyledTitle text="Convierte tus datos en {resultados claros} y útiles" color="blue" />
            </m.h1>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light leading-body max-w-xl mb-8"
            >
              En Máxima Consultoría te ayudamos a diseñar, analizar e interpretar tus datos
              con un enfoque estadístico sólido. Estamos especializados en bioestadística, pero
              también podemos ayudarte con estudios de cualquier ámbito que necesiten análisis
              de datos fiable.
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <PrimaryCTA onClick={onOpenForm}>Solicitar consulta gratuita</PrimaryCTA>
              <SecondaryCTA href="#servicios">Ver servicios</SecondaryCTA>
            </m.div>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light mt-5"
            >
              Cuéntanos tu caso y te orientaremos sin compromiso sobre el análisis más adecuado.
            </m.p>
          </div>

          {/* Right: data-themed visual */}
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full"
          >
            <HeroVisual />
          </m.div>
        </div>

        {/* Confidence strip */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-14 md:mt-16 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:gap-x-5"
        >
          {HERO_CHIPS.map((chip) => (
            <span
              key={chip}
              className="text-mx-text-muted text-label-sm md:text-label-md font-medium tracking-wide"
            >
              {chip}
              <span className="mx-3 md:mx-5 text-mx-border" aria-hidden>|</span>
            </span>
          ))}
        </m.div>
      </div>
    </section>
  );
}

// Decorative SVG visual: faux dashboard with scatter + bars + line
function HeroVisual() {
  return (
    <div className="relative w-full aspect-[5/4] max-w-lg mx-auto">
      <div className="absolute inset-0 bg-mx-card rounded-2xl border border-mx-border shadow-[0_30px_80px_-30px_rgba(82,123,231,0.25)] overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-mx-border">
          <span className="w-2.5 h-2.5 rounded-full bg-mx-border" />
          <span className="w-2.5 h-2.5 rounded-full bg-mx-border" />
          <span className="w-2.5 h-2.5 rounded-full bg-mx-border" />
          <span className="ml-3 text-mx-text-muted text-[10px] tracking-widest uppercase">Análisis · maxima.r</span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 h-[calc(100%-2.75rem)]">
          {/* Scatter plot */}
          <div className="rounded-lg bg-mx-bg border border-mx-border p-3 flex flex-col">
            <span className="text-[9px] text-mx-text-muted tracking-widest uppercase mb-2">Dispersión</span>
            <svg viewBox="0 0 100 60" className="flex-1 w-full">
              <line x1="5" y1="55" x2="95" y2="55" stroke="#e5e5e5" strokeWidth="0.5" />
              <line x1="5" y1="5" x2="5" y2="55" stroke="#e5e5e5" strokeWidth="0.5" />
              {[
                [15, 45], [22, 38], [28, 42], [35, 30], [42, 25], [49, 28],
                [55, 18], [62, 22], [68, 14], [75, 17], [82, 10], [88, 12],
                [25, 50], [40, 40], [60, 30], [78, 24],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1.6" fill="#527BE7" opacity="0.7" />
              ))}
              <path d="M 5 50 Q 50 30 95 8" fill="none" stroke="#F7A000" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Bar chart */}
          <div className="rounded-lg bg-mx-bg border border-mx-border p-3 flex flex-col">
            <span className="text-[9px] text-mx-text-muted tracking-widest uppercase mb-2">Grupos</span>
            <svg viewBox="0 0 100 60" className="flex-1 w-full">
              <line x1="5" y1="55" x2="95" y2="55" stroke="#e5e5e5" strokeWidth="0.5" />
              {[
                { x: 10, h: 30, fill: '#527BE7' },
                { x: 26, h: 42, fill: '#527BE7' },
                { x: 42, h: 22, fill: '#F7A000' },
                { x: 58, h: 38, fill: '#527BE7' },
                { x: 74, h: 48, fill: '#F7A000' },
                { x: 88, h: 28, fill: '#527BE7' },
              ].map((b, i) => (
                <rect key={i} x={b.x} y={55 - b.h} width="9" height={b.h} fill={b.fill} opacity="0.85" rx="1" />
              ))}
            </svg>
          </div>

          {/* Table-like rows */}
          <div className="col-span-2 rounded-lg bg-mx-bg border border-mx-border p-3">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[9px] text-mx-text-muted tracking-widest uppercase">Resultados · p &lt; 0.05</span>
              <span className="inline-flex items-center gap-1 text-[9px] text-mx-orange font-medium">
                <CheckCircle2 size={10} /> Significativo
              </span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'Grupo control', value: '0.42', bar: 50 },
                { label: 'Tratamiento A', value: '0.71', bar: 78 },
                { label: 'Tratamiento B', value: '0.58', bar: 64 },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2 text-[10px] text-mx-text">
                  <span className="w-24 shrink-0">{row.label}</span>
                  <span className="flex-1 h-1.5 rounded-full bg-mx-border overflow-hidden">
                    <span className="block h-full bg-mx-blue" style={{ width: `${row.bar}%` }} />
                  </span>
                  <span className="text-mx-text-muted w-8 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative dots */}
      <span className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-mx-orange/20" />
      <span className="absolute -bottom-4 -left-4 w-10 h-10 rounded-full bg-mx-blue/15" />
    </div>
  );
}

// ─── 2. Problem ─────────────────────────────────────────────────────────────

const PAIN_BLOCKS = [
  {
    icon: HelpCircle,
    title: 'No sabes qué prueba estadística utilizar',
    body:
      'Te ayudamos a elegir el análisis adecuado según tus objetivos, variables, diseño del estudio y características de los datos.',
  },
  {
    icon: GraduationCap,
    title: 'Necesitas resultados sólidos para una tesis, artículo o informe',
    body:
      'Preparamos análisis rigurosos y explicados de forma clara para que puedas defenderlos, presentarlos o publicarlos con seguridad.',
  },
  {
    icon: Database,
    title: 'Tienes una base de datos compleja o desordenada',
    body:
      'Revisamos, depuramos y estructuramos tus datos para que el análisis sea coherente, reproducible y útil.',
  },
  {
    icon: LineChart,
    title: 'No sabes cómo interpretar los resultados',
    body:
      'No solo calculamos: te ayudamos a comprender qué significan los resultados y cómo conectarlos con tus objetivos.',
  },
];

export function ProblemSection({ onOpenForm }: SectionProps) {
  return (
    <section className={SECTION_CLS}>
      <div className={CONTAINER_CLS}>
        <div className="text-center mb-10 md:mb-14">
          <m.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className={`${H2_CLS} mb-5 mx-auto`}
          >
            <StyledTitle text="¿Tienes datos pero no sabes cómo {interpretarlos?}" color="blue" />
          </m.h2>
          <p className={`${SUBTITLE_CLS} mx-auto`}>
            Muchos proyectos se bloquean cuando llega el momento de elegir el análisis
            estadístico, calcular el tamaño muestral, preparar la base de datos o interpretar
            los resultados. Un análisis mal planteado puede afectar a las conclusiones de una
            tesis, artículo, informe o proyecto profesional.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {PAIN_BLOCKS.map((b, i) => (
            <m.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="bg-mx-card border border-mx-border rounded-xl p-6 hover:border-mx-orange/40 hover:shadow-lg hover:shadow-mx-orange/5 transition-all duration-300"
            >
              <div className="text-mx-orange mb-4">
                <b.icon size={32} strokeWidth={1.75} />
              </div>
              <h3 className="text-mx-text text-body-md md:text-body-lg 2xl:text-heading-sm font-bold leading-snug mb-2">
                {b.title}
              </h3>
              <p className="text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light leading-relaxed">
                {b.body}
              </p>
            </m.div>
          ))}
        </div>

        <div className="mt-10 md:mt-14 text-center">
          <PrimaryCTA onClick={onOpenForm}>
            ¿Te ocurre algo parecido? Solicita consulta gratuita
          </PrimaryCTA>
        </div>
      </div>
    </section>
  );
}

// ─── 3. Services ────────────────────────────────────────────────────────────

const SERVICES = [
  {
    icon: Target,
    title: 'Diseño del estudio y planificación estadística',
    body:
      'Te ayudamos a definir objetivos, hipótesis, variables, diseño metodológico, criterios de inclusión, recogida de datos y estrategia de análisis. Ideal para proyectos que aún no han empezado o están en fase de protocolo.',
    items: [
      'Diseño del análisis estadístico',
      'Orientación metodológica',
      'Definición de variables',
      'Planificación de la recogida de datos',
      'Revisión del protocolo de investigación',
    ],
  },
  {
    icon: Calculator,
    title: 'Cálculo de tamaño muestral y potencia estadística',
    body:
      'Calculamos cuántas observaciones, pacientes, muestras, participantes o registros necesitas para obtener resultados fiables. Te ayudamos a evitar estudios con muestra insuficiente o mal dimensionada.',
    items: [
      'Tamaño muestral mínimo',
      'Potencia estadística',
      'Tamaño del efecto',
      'Justificación metodológica para protocolo, TFM, tesis o proyecto',
    ],
  },
  {
    icon: LineChart,
    title: 'Análisis estadístico de datos',
    body:
      'Realizamos análisis adaptados a tus objetivos, desde estadística descriptiva hasta modelos avanzados. Aplicamos la técnica adecuada en función del tipo de datos y la pregunta de investigación.',
    items: [
      'Estadística descriptiva',
      'Contrastes de hipótesis',
      'Comparación entre grupos',
      'Correlaciones y asociaciones',
      'Regresión lineal, logística u otros modelos',
      'Análisis multivariante, longitudinal y supervivencia',
      'Modelos predictivos y machine learning aplicado',
    ],
  },
  {
    icon: Microscope,
    title: 'Bioestadística para salud y ciencias de la vida',
    body:
      'Apoyo especializado para estudios clínicos, biomédicos, sanitarios, farmacéuticos, nutricionales, epidemiológicos, psicológicos, odontológicos, enfermeros, fisioterapéuticos y de ciencias de la vida.',
    items: [
      'Estudios observacionales',
      'Ensayos e intervenciones',
      'Estudios de pacientes e investigación clínica',
      'Proyectos de salud pública',
      'Estudios de laboratorio y datos biomédicos',
    ],
  },
  {
    icon: GraduationCap,
    title: 'Tesis, TFG, TFM y artículos científicos',
    body:
      'Acompañamos a estudiantes, doctorandos e investigadores en el análisis estadístico de sus trabajos académicos o publicaciones científicas, con resultados claros y defendibles.',
    items: [
      'Tablas para memoria o artículo',
      'Figuras y gráficos',
      'Interpretación de resultados',
      'Redacción metodológica del análisis',
      'Apoyo para responder a revisores o tribunales',
    ],
  },
  {
    icon: FileBarChart,
    title: 'Informes, visualización e interpretación',
    body:
      'Convertimos los resultados en un informe comprensible, ordenado y útil para la toma de decisiones. El objetivo es que sepas qué se ha hecho, por qué y qué significan los resultados.',
    items: [
      'Informe metodológico',
      'Tablas listas para usar',
      'Gráficos claros',
      'Interpretación de resultados',
      'Recomendaciones para conclusiones',
      'Resumen ejecutivo para perfiles no técnicos',
    ],
  },
];

export function ServicesSection({ onOpenForm }: SectionProps) {
  return (
    <section id="servicios" className={SECTION_CLS}>
      <div className={CONTAINER_CLS}>
        <div className="text-center mb-12 md:mb-16">
          <span className={`${OVERLINE_CLS} mb-4 inline-block`}>Servicios</span>
          <h2 className={`${H2_CLS} mb-5 mx-auto`}>
            <StyledTitle text="Servicios de {consultoría} y análisis de datos" color="blue" />
          </h2>
          <p className={`${SUBTITLE_CLS} mx-auto`}>
            Te acompañamos en todas las fases del estudio: desde el diseño inicial hasta la
            interpretación final de resultados.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {SERVICES.map((s, i) => (
            <m.article
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-mx-card border border-mx-border rounded-xl p-6 md:p-7 hover:border-mx-orange/40 hover:shadow-lg hover:shadow-mx-blue/5 transition-all duration-300 flex flex-col"
            >
              <div className="text-mx-blue mb-5">
                <s.icon size={36} strokeWidth={1.75} />
              </div>
              <h3 className="text-mx-text text-body-lg md:text-heading-sm 2xl:text-heading-md font-bold leading-snug mb-3">
                {s.title}
              </h3>
              <p className="text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light leading-relaxed mb-5">
                {s.body}
              </p>
              <ul className="space-y-1.5 mt-auto">
                {s.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-mx-blue mt-1 shrink-0"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </m.article>
          ))}
        </div>

        {/* Optional extra service */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 md:mt-8 rounded-xl border border-dashed border-mx-blue/40 bg-mx-blue/[0.03] p-6 md:p-7"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="text-mx-blue shrink-0">
              <Sparkles size={32} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-mx-text text-body-lg font-bold mb-1.5">
                Análisis de datos no bioestadísticos
              </h3>
              <p className="text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light leading-relaxed">
                Aunque nuestra especialidad es la bioestadística, también analizamos datos de
                otros ámbitos: educación, empresa, marketing, encuestas, recursos humanos,
                calidad, investigación social, economía aplicada o proyectos internos.
              </p>
            </div>
          </div>
        </m.div>

        <div className="mt-10 md:mt-14 text-center">
          <PrimaryCTA onClick={onOpenForm}>
            ¿No sabes si tu estudio encaja? Pregúntanos sin compromiso
          </PrimaryCTA>
        </div>
      </div>
    </section>
  );
}

// ─── 4. Study types ─────────────────────────────────────────────────────────

const STUDY_CATEGORIES = [
  {
    icon: Microscope,
    title: 'Salud y ciencias biomédicas',
    items: [
      'Medicina',
      'Enfermería',
      'Fisioterapia',
      'Psicología sanitaria',
      'Odontología',
      'Nutrición',
      'Farmacia',
      'Epidemiología',
      'Salud pública',
      'Estudios clínicos',
    ],
  },
  {
    icon: GraduationCap,
    title: 'Investigación académica',
    items: [
      'TFG',
      'TFM',
      'Tesis doctoral',
      'Artículos científicos',
      'Comunicaciones a congresos',
      'Proyectos de investigación',
      'Informes para comités o convocatorias',
    ],
  },
  {
    icon: ClipboardList,
    title: 'Encuestas y cuestionarios',
    items: [
      'Diseño de cuestionarios',
      'Validación de escalas',
      'Análisis de respuestas',
      'Fiabilidad y consistencia interna',
      'Comparación entre perfiles',
      'Segmentación de participantes',
    ],
  },
  {
    icon: Building2,
    title: 'Empresas y organizaciones',
    items: [
      'Análisis de clientes',
      'Indicadores de rendimiento',
      'Estudios de satisfacción',
      'Datos comerciales',
      'Datos de formación',
      'Informes de impacto',
      'Evaluación de programas',
    ],
  },
  {
    icon: Beaker,
    title: 'Otros datos de investigación',
    items: [
      'Datos educativos',
      'Datos sociales',
      'Datos experimentales',
      'Datos longitudinales',
      'Datos de laboratorio',
      'Datos ambientales',
      'Datos de comportamiento',
    ],
  },
];

export function StudyTypesSection({ onOpenForm }: SectionProps) {
  return (
    <section className={`${SECTION_CLS} bg-mx-blue/[0.03]`}>
      <div className={CONTAINER_CLS}>
        <div className="text-center mb-12 md:mb-16">
          <span className={`${OVERLINE_CLS} mb-4 inline-block`}>Tipos de estudios</span>
          <h2 className={`${H2_CLS} mb-5 mx-auto`}>
            <StyledTitle text="Bioestadística y {cualquier proyecto} basado en datos" color="blue" />
          </h2>
          <p className={`${SUBTITLE_CLS} mx-auto`}>
            Si tienes una pregunta, una base de datos o una hipótesis que quieres contrastar,
            podemos ayudarte a elegir el enfoque analítico adecuado.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {STUDY_CATEGORIES.map((cat, i) => (
            <m.div
              key={cat.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="bg-mx-card border border-mx-border rounded-xl p-6 hover:border-mx-blue/40 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-mx-orange">
                  <cat.icon size={28} strokeWidth={1.75} />
                </div>
                <h3 className="text-mx-text text-body-md md:text-body-lg font-bold">
                  {cat.title}
                </h3>
              </div>
              <ul className="space-y-1.5">
                {cat.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light"
                  >
                    <span className="w-1 h-1 rounded-full bg-mx-orange mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </m.div>
          ))}

          {/* "Otros casos" CTA card filling the last grid cell */}
          <m.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: STUDY_CATEGORIES.length * 0.06 }}
            className="rounded-xl border border-dashed border-mx-orange/40 bg-mx-orange/[0.04] p-6 flex flex-col justify-center"
          >
            <div className="text-mx-orange mb-4">
              <HelpCircle size={28} strokeWidth={1.75} />
            </div>
            <h3 className="text-mx-text text-body-lg font-bold mb-2">
              ¿Tu caso no aparece?
            </h3>
            <p className="text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light mb-4 leading-relaxed">
              Si tienes datos y necesitas tomar decisiones, validar una hipótesis o presentar
              resultados, podemos ayudarte aunque tu proyecto no sea estrictamente biomédico.
            </p>
            <button
              type="button"
              onClick={onOpenForm}
              className="self-start inline-flex items-center gap-2 text-mx-orange hover:text-mx-orange-dark text-label-md font-medium hover:cursor-pointer"
            >
              Quiero saber si podéis analizarlo <ArrowRight size={14} />
            </button>
          </m.div>
        </div>
      </div>
    </section>
  );
}

// ─── 5. Process ─────────────────────────────────────────────────────────────

const PROCESS_STEPS = [
  {
    title: 'Nos cuentas tu caso',
    body:
      'Rellenas el formulario con una breve descripción del estudio, los objetivos, el tipo de datos y el momento en el que se encuentra el proyecto.',
  },
  {
    title: 'Analizamos tus necesidades',
    body:
      'Revisamos qué necesitas: diseño del estudio, tamaño muestral, análisis estadístico, revisión de base de datos, interpretación o informe final.',
  },
  {
    title: 'Te proponemos el enfoque adecuado',
    body:
      'Te orientamos sobre el tipo de análisis recomendado, los posibles entregables y el alcance del trabajo.',
  },
  {
    title: 'Realizamos el análisis',
    body:
      'Aplicamos las técnicas estadísticas necesarias, revisamos la coherencia de los resultados y preparamos tablas, gráficos e interpretación.',
  },
  {
    title: 'Recibes resultados claros y aplicables',
    body:
      'Te entregamos un informe o material adaptado a tu objetivo: tesis, artículo, presentación, informe profesional o toma de decisiones.',
  },
];

export function ProcessSection({ onOpenForm }: SectionProps) {
  return (
    <section className={SECTION_CLS}>
      <div className={CONTAINER_CLS}>
        <div className="text-center mb-12 md:mb-16">
          <span className={`${OVERLINE_CLS} mb-4 inline-block`}>Cómo trabajamos</span>
          <h2 className={`${H2_CLS} mb-5 mx-auto`}>
            <StyledTitle text="Cómo trabajamos {contigo}" color="blue" />
          </h2>
          <p className={`${SUBTITLE_CLS} mx-auto`}>
            Un proceso sencillo, transparente y adaptado a tu estudio.
          </p>
        </div>

        <ol className="relative space-y-6 md:space-y-0 md:grid md:grid-cols-5 md:gap-4">
          {/* Connector line on desktop */}
          <span
            aria-hidden
            className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px bg-mx-border"
          />
          {PROCESS_STEPS.map((step, i) => (
            <m.li
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative md:text-center"
            >
              <div className="flex md:flex-col items-start md:items-center gap-4 md:gap-3">
                <div className="relative shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-full bg-mx-card border-2 border-mx-orange text-mx-orange font-black text-body-lg z-10">
                  {i + 1}
                </div>
                <div className="md:px-2">
                  <h3 className="text-mx-text text-body-md md:text-body-lg font-bold mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            </m.li>
          ))}
        </ol>

        <div className="mt-12 md:mt-16 flex flex-col items-center gap-4 text-center">
          <PrimaryCTA onClick={onOpenForm}>Empieza con una consulta gratuita</PrimaryCTA>
          <p className="text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light flex items-center gap-2">
            <Lock size={14} className="text-mx-blue" />
            Trabajamos con confidencialidad y tratamos cada proyecto de forma personalizada.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── 6. Deliverables ────────────────────────────────────────────────────────

const DELIVERABLES = [
  'Revisión de objetivos y preguntas de investigación',
  'Revisión o depuración de la base de datos, si procede',
  'Selección justificada de las pruebas estadísticas',
  'Análisis descriptivo de variables',
  'Tablas de resultados',
  'Gráficos y visualizaciones',
  'Modelos estadísticos cuando sean necesarios',
  'Interpretación de resultados en lenguaje claro',
  'Informe metodológico con explicación del análisis realizado',
  'Recomendaciones para conclusiones, discusión o toma de decisiones',
  'Material listo para incluir en tesis, artículo, memoria o informe',
];

export function DeliverablesSection({ onOpenForm }: SectionProps) {
  return (
    <section className={`${SECTION_CLS} bg-mx-blue/[0.03]`}>
      <div className={CONTAINER_CLS}>
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start">
          <div>
            <span className={`${OVERLINE_CLS} mb-4 inline-block`}>Qué recibes</span>
            <h2 className={`${H2_CLS} mb-5`}>
              <StyledTitle text="¿Qué puedes recibir al {contratar el análisis?}" color="blue" />
            </h2>
            <p className={SUBTITLE_CLS}>
              El entregable se adapta a tu proyecto, pero siempre buscamos que los resultados
              sean claros, útiles y defendibles.
            </p>

            <div className="mt-8 rounded-xl bg-mx-card border-l-4 border-mx-orange p-5 md:p-6 shadow-sm">
              <p className="text-mx-text text-body-md md:text-body-lg font-medium leading-snug">
                No entregamos solo números. Te ayudamos a entender qué dicen tus datos y cómo
                presentarlos correctamente.
              </p>
            </div>

            <div className="mt-8">
              <PrimaryCTA onClick={onOpenForm}>
                Quiero recibir orientación sobre mi análisis
              </PrimaryCTA>
            </div>
          </div>

          <ul className="bg-mx-card border border-mx-border rounded-2xl p-6 md:p-8 grid sm:grid-cols-2 gap-x-6 gap-y-3.5">
            {DELIVERABLES.map((d, i) => (
              <m.li
                key={d}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="flex items-start gap-3 text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light"
              >
                <CheckCircle2 size={16} className="text-mx-orange mt-0.5 shrink-0" />
                <span>{d}</span>
              </m.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─── 7. Differentials ───────────────────────────────────────────────────────

const BENEFITS = [
  {
    icon: Microscope,
    title: 'Especialización en bioestadística',
    body:
      'Conocemos las necesidades habituales de estudios sanitarios, biomédicos y de ciencias de la vida, donde la elección del análisis y la interpretación son especialmente importantes.',
  },
  {
    icon: Target,
    title: 'Análisis adaptado a tus objetivos',
    body:
      'No aplicamos pruebas de forma automática. Primero entendemos qué quieres responder y después proponemos el enfoque estadístico más adecuado.',
  },
  {
    icon: MessageCircle,
    title: 'Resultados explicados de forma clara',
    body:
      'Te ayudamos a comprender qué significan los resultados para que puedas defenderlos, publicarlos o usarlos en la toma de decisiones.',
  },
  {
    icon: ShieldCheck,
    title: 'Confidencialidad',
    body:
      'Tratamos la información de cada proyecto con seriedad, discreción y respeto por la privacidad de los datos.',
  },
  {
    icon: Handshake,
    title: 'Acompañamiento cercano',
    body:
      'Puedes plantearnos tus dudas y recibir una orientación comprensible, incluso si no tienes formación estadística avanzada.',
  },
  {
    icon: Layers,
    title: 'Flexibilidad',
    body:
      'Trabajamos con proyectos bioestadísticos, académicos, sanitarios, empresariales, educativos y de otros ámbitos donde sea necesario analizar datos.',
  },
];

export function BenefitsSection() {
  return (
    <section className={SECTION_CLS}>
      <div className={CONTAINER_CLS}>
        <div className="text-center mb-12 md:mb-16">
          <span className={`${OVERLINE_CLS} mb-4 inline-block`}>Por qué Máxima</span>
          <h2 className={`${H2_CLS} mb-5 mx-auto`}>
            <StyledTitle text="Por qué confiar tu análisis a {Máxima}" color="blue" />
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {BENEFITS.map((b, i) => (
            <m.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-mx-card border border-mx-border rounded-xl p-6 md:p-7 hover:border-mx-blue/40 hover:shadow-lg hover:shadow-mx-blue/5 transition-all duration-300"
            >
              <div className="text-mx-blue mb-4">
                <b.icon size={36} strokeWidth={1.75} />
              </div>
              <h3 className="text-mx-text text-body-md md:text-body-lg 2xl:text-heading-sm font-bold leading-snug mb-2">
                {b.title}
              </h3>
              <p className="text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light leading-relaxed">
                {b.body}
              </p>
            </m.div>
          ))}
        </div>

        <p className="mt-10 md:mt-14 text-center text-mx-text text-body-md md:text-body-lg font-medium italic">
          Tu estudio merece un análisis que esté a la altura de tus objetivos.
        </p>
      </div>
    </section>
  );
}

// ─── 8. Use cases ───────────────────────────────────────────────────────────

const USE_CASES = [
  'Estás preparando una tesis, TFG o TFM y necesitas analizar tus datos.',
  'Quieres publicar un artículo científico y necesitas resultados estadísticos sólidos.',
  'Tienes una base de datos sanitaria, clínica o biomédica y no sabes cómo enfocarla.',
  'Necesitas calcular el tamaño muestral antes de iniciar un estudio.',
  'Has recogido datos mediante encuestas o cuestionarios y quieres interpretarlos correctamente.',
  'Tienes dudas sobre qué prueba estadística utilizar.',
  'Necesitas tablas y gráficos claros para un informe, memoria o presentación.',
  'Quieres validar una hipótesis o comparar grupos.',
  'Necesitas un informe comprensible para tomar decisiones.',
  'Tienes datos de empresa, formación, marketing, educación u otro ámbito y quieres extraer conclusiones fiables.',
];

export function UseCasesSection({ onOpenForm }: SectionProps) {
  return (
    <section className={`${SECTION_CLS} bg-mx-blue/[0.03]`}>
      <div className={CONTAINER_CLS}>
        <div className="text-center mb-10 md:mb-14">
          <span className={`${OVERLINE_CLS} mb-4 inline-block`}>Casos de uso</span>
          <h2 className={`${H2_CLS} mx-auto`}>
            <StyledTitle text="Esta consultoría {es para ti} si..." color="blue" />
          </h2>
        </div>

        <ul className="bg-mx-card border border-mx-border rounded-2xl p-6 md:p-10 grid md:grid-cols-2 gap-x-8 gap-y-4 max-w-5xl mx-auto">
          {USE_CASES.map((c, i) => (
            <m.li
              key={c}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="flex items-start gap-3 text-mx-text text-body-sm md:text-body-md font-light leading-relaxed"
            >
              <CheckCheck size={18} className="text-mx-orange mt-0.5 shrink-0" />
              <span>{c}</span>
            </m.li>
          ))}
        </ul>

        <div className="mt-10 md:mt-14 text-center">
          <PrimaryCTA onClick={onOpenForm}>Sí, necesito ayuda con mi estudio</PrimaryCTA>
        </div>
      </div>
    </section>
  );
}

// ─── 9. Free consult highlight ──────────────────────────────────────────────

const HIGHLIGHT_POINTS = [
  'Sin compromiso',
  'Respuesta personalizada',
  'Orientación inicial sobre el análisis más adecuado',
  'Válido para estudios bioestadísticos y otros proyectos con datos',
];

export function FreeConsultHighlight({ onOpenForm }: SectionProps) {
  return (
    <section className="relative py-16 md:py-20 lg:py-24 px-6 md:px-12 bg-gradient-to-br from-mx-blue to-[#3a5dc4] text-white overflow-hidden">
      {/* Decorative blobs */}
      <span className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-mx-orange/20 blur-3xl pointer-events-none" />
      <span className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      <div className={`${CONTAINER_CLS} relative text-center`}>
        <span className="inline-block text-mx-orange text-label-sm md:text-label-md tracking-[0.3em] uppercase font-medium mb-4">
          Consulta gratuita
        </span>
        <h2 className="text-heading-lg md:text-display-sm xl:text-display-sm font-black leading-display tracking-display mb-5 text-balance max-w-3xl mx-auto">
          Solicita una consulta gratuita
        </h2>
        <p className="text-white/80 text-body-md md:text-body-lg font-light leading-body mb-8 max-w-2xl mx-auto text-balance">
          Cuéntanos brevemente tu proyecto, qué datos tienes y qué necesitas obtener.
          Revisaremos tu caso y te orientaremos sobre el mejor enfoque para avanzar con
          seguridad.
        </p>

        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-9 text-white/90 text-body-sm">
          {HIGHLIGHT_POINTS.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-mx-orange shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onOpenForm}
          className="group inline-flex items-center gap-3 bg-mx-orange text-white px-8 py-4 text-label-md font-medium rounded-full hover:bg-mx-orange-dark transition-colors duration-300 hover:cursor-pointer shadow-lg shadow-black/20"
        >
          Solicitar consulta gratuita
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-5 text-white/70 text-body-sm font-light max-w-xl mx-auto">
          No necesitas tenerlo todo claro. Precisamente podemos ayudarte a definir el mejor camino.
        </p>
      </div>
    </section>
  );
}

// ─── 11. Embedded form ──────────────────────────────────────────────────────

export function FormSection() {
  return (
    <section id="formulario" className={`${SECTION_CLS} bg-mx-blue/[0.03]`}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <span className={`${OVERLINE_CLS} mb-4 inline-block`}>Formulario</span>
          <h2 className={`${H2_CLS} mb-5 mx-auto`}>
            <StyledTitle text="Cuéntanos tu estudio y te {orientamos gratis}" color="blue" />
          </h2>
          <p className={`${SUBTITLE_CLS} mx-auto`}>
            Rellena el formulario y dinos qué necesitas analizar. Te responderemos con una
            primera orientación sobre cómo podemos ayudarte.
          </p>
        </div>

        <div className="bg-mx-card border border-mx-border rounded-2xl p-6 md:p-10 shadow-[0_30px_80px_-30px_rgba(82,123,231,0.2)]">
          <ConsultoriaForm />
        </div>

        <p className="mt-6 text-center text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light flex items-center justify-center gap-2">
          <Lock size={14} className="text-mx-blue" />
          Tus datos se tratarán de forma confidencial. La consulta inicial no implica compromiso
          de contratación.
        </p>
      </div>
    </section>
  );
}

// ─── 12. Closing ────────────────────────────────────────────────────────────

export function ClosingSection({ onOpenForm }: SectionProps) {
  return (
    <section className={`${SECTION_CLS} text-center`}>
      <div className={CONTAINER_CLS}>
        <m.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className={`${H2_CLS} mb-6 mx-auto`}
        >
          <StyledTitle text="Convierte tus datos en {conclusiones fiables}" color="blue" />
        </m.h2>
        <p className={`${SUBTITLE_CLS} mx-auto mb-8`}>
          Un buen análisis estadístico puede marcar la diferencia entre tener datos y tener
          respuestas. En Máxima Consultoría podemos ayudarte a ordenar tu estudio, aplicar el
          análisis adecuado e interpretar los resultados con claridad.
        </p>

        <PrimaryCTA onClick={onOpenForm}>Solicitar consulta gratuita</PrimaryCTA>

        <p className="mt-8 text-mx-text text-body-md md:text-body-lg font-medium italic max-w-xl mx-auto">
          Cuéntanos tu caso. Te ayudamos a saber por dónde empezar.
        </p>
      </div>
    </section>
  );
}
