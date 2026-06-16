// ============ Internationalization ============

export type Locale = 'es' | 'en';

export type LocalizedString = {
  es: string;
  en: string;
};

// ============ Content Blocks ============

export interface TextBlock {
  type: 'text';
  html: string;
}

export interface VideoBlock {
  type: 'video';
  provider?: 'vimeo' | 'youtube';
  vimeoId?: string;
  youtubeId?: string;
  videoHash?: string;
  title?: string;
}

export interface ImageBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
}

export interface CodeBlock {
  type: 'code';
  language: string;
  code: string;
  fileName?: string;
}

export interface CalloutBlock {
  type: 'callout';
  variant: 'info' | 'warning' | 'tip';
  title?: string;
  content: string;
}

export interface DownloadFile {
  label: string;
  description?: string;
  url: string;
  name: string;
  mime: string;
  sizeKB: number;
}

export interface DownloadBlock {
  type: 'download';
  title?: string;
  description?: string;
  files: DownloadFile[];
}

export interface EmbedBlock {
  type: 'embed';
  html: string;
  provider?: string;
}

export type ContentBlock =
  | TextBlock
  | VideoBlock
  | ImageBlock
  | CodeBlock
  | CalloutBlock
  | DownloadBlock
  | EmbedBlock;

export type LocalizedContent = {
  es: ContentBlock[];
  en: ContentBlock[];
};

// ============ Course Structure ============

export interface MaxymiaExam {
  id: string;
  title: LocalizedString;
  description?: LocalizedString;
  passingScore: number; // 0-100
  questions: ExamQuestion[];
}

export interface MaxymiaTopic {
  id: string;
  /** Durable progress id for this unit (stable across saves/renames). Strapi
   *  always populates it; optional only for the static demo fallback (uses id). */
  uid?: string;
  title: LocalizedString;
  anchorId: string;
  /** Content blocks that belong to THIS topic (per H3 section in the docx). */
  content: LocalizedContent;
}

export interface MaxymiaLesson {
  id: string;
  /** Durable progress id used when the lesson has NO topics (it is its own unit).
   *  Strapi always populates it; optional only for the static demo fallback. */
  uid?: string;
  title: LocalizedString;
  description: LocalizedString;
  intro?: LocalizedContent;
  content: LocalizedContent;
  estimatedMinutes: number;
  topics: MaxymiaTopic[];
}

export interface MaxymiaBlock {
  id: string;
  title: LocalizedString;
  content: LocalizedContent;
  lessons: MaxymiaLesson[];
  exams: MaxymiaExam[];
}

export type MaxymiaCategory = 'ia' | 'data-science' | 'machine-learning' | 'nlp' | 'computer-vision';
export type MaxymiaLevel = 'beginner' | 'intermediate' | 'advanced';

export interface MaxymiaInstructor {
  name: string;
  role: string;
  avatar?: string;
}

/** Docente de la ficha (sale de `author` en Strapi): perfil completo con bio. */
export interface MaxymiaDocente {
  documentId: string;
  slug?: string;
  name: string;
  role: string;
  roleDescription?: string;
  avatar?: string;
  /** Markdown (campo richtext `bio` del author). */
  bio?: string;
  linkedin?: string;
  email?: string;
}

export interface MaxymiaCourse {
  id: string;
  slug: string;
  title: LocalizedString;
  description: LocalizedString;
  image: string;
  blocks: MaxymiaBlock[];
  price: number;
  language: Locale | 'bilingual';
  instructor: MaxymiaInstructor;
  /** Docente(s) de la sección "Docente" — relación a `author` en Strapi. */
  docentes?: MaxymiaDocente[];
  level: MaxymiaLevel;
  isPro: boolean;
  /** Per-course toggle for the 20% Pro discount (opt-in). */
  haveDiscount: boolean;
  tags: string[];
  category: MaxymiaCategory;
  thumbnailTitle?: LocalizedString;
  originalPrice?: number;
  createdAt?: string;
  careers?: string;
  objectives?: string;
  audiences?: string;
  /** Duración manual (horas) editable desde Strapi. Si está, sustituye a la
   *  duración autocalculada (suma de minutos de las lecciones), que para
   *  cursos cortos quedaba demasiado baja. */
  durationHours?: number;
  /** Sellos de confianza SELECCIONADOS para este curso (relación a `badge`
   *  en Strapi). Específicos por curso, no los globales de la home.
   *  `category` agrupa los sellos en la ficha (p. ej. "Ciberseguridad"). */
  badges?: { name: string; imageUrl: string; category?: string | null }[];
  /** Instituciones/clientes SELECCIONADOS para este curso (relación a
   *  `institution` en Strapi). */
  institutions?: { name: string; imageUrl: string }[];
  /** Preguntas frecuentes de la ficha. Opcional: la sección sólo se
   *  pinta cuando hay al menos una. Mismo formato pregunta/respuesta que
   *  las FAQ de los programas de Máxima, listo para alimentarse desde el
   *  fallback (app/maxymia/data/courses.ts) o un futuro campo en Strapi. */
  faqs?: { question: string; answer: string }[];
  /** "Cómos": pregunta-problema ("¿Cómo…?") + respuesta. Sustituye a la
   *  Descripción en la ficha cuando hay alguno (más llamativo). */
  comos?: { question: string; answer: string }[];
}

// ============ Exam Question Types ============

export interface SingleChoiceQuestion {
  type: 'single_choice';
  id: string;
  question: LocalizedString;
  options: LocalizedString[];
  correctIndex: number;
  explanation?: LocalizedString | null;
}

export interface MultipleChoiceQuestion {
  type: 'multiple_choice';
  id: string;
  question: LocalizedString;
  options: LocalizedString[];
  correctIndices: number[];
  explanation?: LocalizedString | null;
}

export interface OrderingQuestion {
  type: 'ordering';
  id: string;
  question: LocalizedString;
  items: LocalizedString[];
  correctOrder: number[];
  explanation?: LocalizedString | null;
}

export interface FillBlankQuestion {
  type: 'fill_blank';
  id: string;
  question: LocalizedString;
  blanks: { acceptedAnswers: string[] }[];
  explanation?: LocalizedString | null;
}

export interface FreeTextQuestion {
  type: 'free_text';
  id: string;
  question: LocalizedString;
  sampleAnswer: LocalizedString;
  explanation?: LocalizedString | null;
}

export type ExamQuestion =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | OrderingQuestion
  | FillBlankQuestion
  | FreeTextQuestion;

// ============ Progress & Results ============

export interface ExamResult {
  examId: string;
  courseId: string;
  blockId: string;
  score: number;
  passed: boolean;
  answers: Record<string, unknown>;
  completedAt: string;
}

export interface MaxymiaCourseProgress {
  courseId: string;
  completedLessons: string[];
  currentLessonId: string | null;
  examResults: Record<string, ExamResult>;
  startedAt: string;
  lastAccessedAt: string;
}

// ============ Query Helpers ============

export interface MaxymiaCourseFilters {
  category?: MaxymiaCategory;
  level?: MaxymiaLevel;
  language?: Locale | 'bilingual';
  search?: string;
}

export interface LessonNavigation {
  current: { blockId: string; lessonId: string; title: LocalizedString };
  prev: { blockId: string; lessonId: string; title: LocalizedString } | null;
  next: { blockId: string; lessonId: string; title: LocalizedString } | null;
  blockTitle: LocalizedString;
  courseSlug: string;
  courseTitle: LocalizedString;
  totalLessons: number;
  currentIndex: number;
}
