// Strapi response wrapper types
export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
  ext: string;
  mime: string;
  size: number;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  } | null;
  url: string;
  mime: string;
}

// Strapi content types

// Legacy module component (embedded in programs)
export interface StrapiModuleComponent {
  id: number;
  title: string;
  description: string;
  hours: number;
  topics: string[] | null;
}

// New Module collection type (for lesson system)
export interface StrapiModule {
  id: number;
  documentId: string;
  title: string;
  description: string;
  order: number;
  lessons?: StrapiLesson[] | null;
  program?: StrapiProgram | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

// New Lesson collection type
export interface StrapiLesson {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string | null;
  cloudflareVideoId: string | null;
  duration: number;
  order: number;
  isFree: boolean;
  resources: StrapiMedia[] | null;
  module?: StrapiModule | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StrapiProgram {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  type: 'Master' | 'Curso';
  duration: string;
  ects: string;
  tags: string[] | null;
  featured: boolean;
  isPro: boolean;
  description: string;
  longDescription: string | null;
  image: StrapiMedia | null;
  imageUrl: string | null;
  format: 'Online' | 'Presencial' | 'Híbrido';
  language: 'Español' | 'Inglés' | 'Bilingüe';
  startDate: string | null;
  certification: string | null;
  price: number | null;
  originalPrice: number | null;
  modules: StrapiModuleComponent[] | null;
  moduleRelations?: StrapiModule[] | null;
  stripeProductId: string | null;
  stripePriceId: string | null;
  audience: string[] | null;
  careers: string[] | null;
  objectives: string[] | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StrapiAuthor {
  id: number;
  name: string;
  role: string;
  avatar: StrapiMedia | null;
}

export interface StrapiBlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: StrapiMedia | null;
  imageUrl: string | null;
  category: 'Estadística' | 'Data Science' | 'R Software' | 'Formación' | 'Casos de Éxito';
  author: StrapiAuthor | null;
  publishedAt: string | null;
  readTime: string | null;
  tags: string[] | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Frontend-compatible types (matching existing interfaces)
export interface ProgramModule {
  title: string;
  description: string;
  hours: number;
  topics: string[];
}

export interface Program {
  id: number;
  documentId: string;
  type: 'Master' | 'Curso';
  title: string;
  slug: string;
  duration: string;
  ects: string;
  tags: string[];
  featured: boolean;
  description: string;
  longDescription: string;
  image: string;
  format: 'Online' | 'Presencial' | 'Híbrido';
  language: 'Español' | 'Inglés' | 'Bilingüe';
  startDate: string;
  certification: string;
  price: number;
  originalPrice?: number;
  modules: ProgramModule[];
  audience: string[];
  careers: string[];
  objectives: string[];
  isPro: boolean;
}

export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: 'Estadística' | 'Data Science' | 'R Software' | 'Formación' | 'Casos de Éxito';
  author: BlogAuthor;
  publishedAt: string;
  readTime: string;
  tags: string[];
  featured: boolean;
}

// Query options
export interface ProgramQueryOptions {
  type?: 'Master' | 'Curso';
  featured?: boolean;
  isPro?: boolean;
  limit?: number;
  page?: number;
  sort?: string;
  draft?: boolean;
}

export interface BlogQueryOptions {
  category?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
  sort?: string;
  draft?: boolean;
}

// ============ Lesson System Types ============

// Frontend Lesson type
export interface Lesson {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  cloudflareVideoId: string | null;
  duration: number;
  order: number;
  isFree: boolean;
  resources: {
    id: number;
    name: string;
    url: string;
    mime: string;
  }[];
  moduleId: number;
}

// Frontend Module with Lessons
export interface ModuleWithLessons {
  id: number;
  documentId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  totalDuration: number;
  lessonCount: number;
}

// Program with full lesson structure
export interface ProgramWithLessons extends Program {
  moduleRelations: ModuleWithLessons[];
  totalLessons: number;
  totalDuration: number;
  stripeProductId: string | null;
  stripePriceId: string | null;
}

// ============ User Purchase & Progress Types ============

export interface PurchasedCourse {
  programId: number;
  documentId: string;
  purchasedAt: string;
  stripePaymentId: string;
  price: number;
}

export interface CourseProgress {
  startedAt: string;
  lastAccessedAt: string;
  completedLessons: string[]; // lesson documentIds
  currentLessonId?: string;
  progressPercent: number;
}

export interface UserCourseData {
  program: ProgramWithLessons | Program;
  purchased: boolean;
  purchasedAt?: string;
  progress?: CourseProgress;
  accessType: 'pro' | 'purchased' | 'none';
}

// Extended Program type with Stripe fields
export interface ProgramWithStripe extends Program {
  stripeProductId: string | null;
  stripePriceId: string | null;
}
