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
  vimeoId: string;
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

export type ContentBlock = TextBlock | VideoBlock | ImageBlock | CodeBlock | CalloutBlock;

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

export interface MaxymiaLesson {
  id: string;
  title: LocalizedString;
  content: LocalizedContent;
  estimatedMinutes: number;
}

export interface MaxymiaBlock {
  id: string;
  title: LocalizedString;
  content: LocalizedContent;
  lessons: MaxymiaLesson[];
  exam?: MaxymiaExam;
}

export type MaxymiaCategory = 'ia' | 'data-science' | 'machine-learning' | 'nlp' | 'computer-vision';
export type MaxymiaLevel = 'beginner' | 'intermediate' | 'advanced';

export interface MaxymiaInstructor {
  name: string;
  role: string;
  avatar?: string;
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
  level: MaxymiaLevel;
  isPro: boolean;
  tags: string[];
  category: MaxymiaCategory;
  thumbnailTitle?: LocalizedString;
  rating?: number;
  studentCount?: number;
  originalPrice?: number;
  createdAt?: string;
}

// ============ Exam Question Types ============

export interface SingleChoiceQuestion {
  type: 'single_choice';
  id: string;
  question: LocalizedString;
  options: LocalizedString[];
  correctIndex: number;
}

export interface MultipleChoiceQuestion {
  type: 'multiple_choice';
  id: string;
  question: LocalizedString;
  options: LocalizedString[];
  correctIndices: number[];
}

export interface OrderingQuestion {
  type: 'ordering';
  id: string;
  question: LocalizedString;
  items: LocalizedString[];
  correctOrder: number[];
}

export interface FillBlankQuestion {
  type: 'fill_blank';
  id: string;
  question: LocalizedString;
  blanks: { acceptedAnswers: string[] }[];
}

export interface FreeTextQuestion {
  type: 'free_text';
  id: string;
  question: LocalizedString;
  sampleAnswer: LocalizedString;
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
