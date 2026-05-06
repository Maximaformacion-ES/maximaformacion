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

interface StrapiMediaFormat {
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
  size: number;
}

// Strapi content types

export interface StrapiTopic {
  id: number;
  documentId: string;
  name: string;
}

export interface Topic {
  id: number;
  documentId: string;
  name: string;
}

// Unit component (embedded in modules)
interface StrapiUnitComponent {
  id: number;
  title: string;
}

// Legacy module component (embedded in programs)
export interface StrapiModuleComponent {
  id: number;
  title: string;
  description: string;
  hours: number;
  units?: StrapiUnitComponent[] | null;
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
  duration: number;
  ects: number;
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
  topics: StrapiTopic[] | null;
  certification: string | null;
  price: number | null;
  originalPrice: number | null;
  modules: StrapiModuleComponent[] | null;
  moduleRelations?: StrapiModule[] | null;
  stripeProductId: string | null;
  stripePriceId: string | null;
  moodleCourseId: number | null;
  moodle: 'data-science' | 'e-learning' | null;
  audience: string | null;
  careers: string | null;
  objectives: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StrapiAuthor {
  id: number;
  documentId: string;
  name: string;
  role: string;
  roleDescription: string | null;
  avatar: StrapiMedia | null;
  email: string | null;
  linkedin: string | null;
}

export type BlogCategory =
  | 'Estadística'
  | 'Data Science'
  | 'R Software'
  | 'Formación'
  | 'Casos de Éxito'
  | 'Experiencias reales'
  | 'General';

export interface StrapiBlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  body: StrapiBlogBodyBlock[] | null;
  image: StrapiMedia | null;
  imageUrl: string | null;
  category: BlogCategory;
  author: StrapiAuthor | null;
  publishedAt: string | null;
  readTime: string | null;
  tags: string[] | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Frontend-compatible types (matching existing interfaces)
export interface ProgramUnit {
  title: string;
}

export interface ProgramModule {
  title: string;
  description: string;
  hours: number;
  units?: ProgramUnit[];
}

export interface Program {
  id: number;
  documentId: string;
  type: 'Master' | 'Curso';
  title: string;
  slug: string;
  duration: number;
  ects: number;
  tags: string[];
  topics: Topic[];
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
  audience: string;
  careers: string;
  objectives: string;
  isPro: boolean;
  moodleCourseId?: number | null;
  moodle?: 'data-science' | 'e-learning' | null;
}

export interface BlogAuthor {
  name: string;
  role: string;
  roleDescription: string;
  avatar: string;
  email: string;
  linkedin: string;
}

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  body: import('@/app/maxymia/types').ContentBlock[];
  image: string;
  category: BlogCategory;
  author: BlogAuthor;
  publishedAt: string;
  readTime: string;
  tags: string[];
  featured: boolean;
}

// ============ Logo Types ============

export interface StrapiLogo {
  id: number;
  documentId: string;
  companyName: string;
  image: StrapiMedia | null;
}

export interface Logo {
  id: number;
  companyName: string;
  imageUrl: string;
}

// ============ Badge Types ============

export type BadgeImportance = 'Low' | 'Medium' | 'Highest';

export interface StrapiBadge {
  id: number;
  documentId: string;
  name: string;
  badge: StrapiMedia | null;
  importance: BadgeImportance | null;
}

export interface Badge {
  id: number;
  name: string;
  imageUrl: string;
  importance: BadgeImportance;
}

// ============ Team Member Types ============

export type TeamRole = 'CEO' | 'Docencia' | 'Comunicación';

export interface StrapiTeamMember {
  id: number;
  documentId: string;
  name: string;
  avatar: StrapiMedia | null;
  linkedin: string | null;
  email: string | null;
  role: TeamRole | null;
}

export interface TeamMember {
  id: number;
  name: string;
  avatar: string;
  linkedin: string;
  email: string;
  role: TeamRole;
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

// ============ Resource Types ============

export type ResourceCategory =
  | 'Guías rápidas'
  | 'TFM'
  | 'Tutoriales'
  | 'Infografías'
  | 'E-books'
  | 'Casos de éxito'
  | 'Otros';

export type ResourceTopic = 'R-Software' | 'Formación online';

export interface StrapiResource {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: ResourceCategory;
  topic: ResourceTopic;
  image: StrapiMedia | null;
  imageUrl: string | null;
  downloads: StrapiMedia[] | null;
  externalUrl: string | null;
  originalPostDate: string | null;
  tags: string[] | null;
  featured: boolean;
  license: string | null;
  author: StrapiAuthor | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceDownload {
  id: number;
  url: string;
  name: string;
  mime: string;
  sizeKB: number;
}

export interface Resource {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: ResourceCategory;
  topic: ResourceTopic;
  image: string;
  downloads: ResourceDownload[];
  externalUrl: string | null;
  publishedAt: string;
  tags: string[];
  featured: boolean;
  license: string;
  author: BlogAuthor;
}

export interface ResourceQueryOptions {
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

// ============ Home Single Type ============

interface StrapiTestimonial {
  id: number;
  text: string;
  name: string;
  role: string | null;
}

export interface StrapiNumericSection {
  id: number;
  students: string;
  bussiness: string;
  activePrograms: string;
  mediaRating: string;
}

export interface StrapiProgramsSection {
  id: number;
  programsOverline: string | null;
  programsTitle: string | null;
}

export interface StrapiPartnersSection {
  id: number;
  partnersOverline: string | null;
  partnersTitle: string;
  partnersLogos: StrapiMedia[];
  partnersDescription: string | null;
}

export interface StrapiTestimonialsSection {
  id: number;
  testimonialsOverline: string | null;
  testimonialsTitle: string;
  testimonial: StrapiTestimonial[];
}

export interface StrapiBadgesSection {
  id: number;
  badgesOverline: string | null;
  badgesTitle: string | null;
  badgesDescription: string | null;
}

interface StrapiFAQ {
  id: number;
  question: string;
  answer: string;
}

export interface StrapiFaqSection {
  id: number;
  faqOverline: string | null;
  faqTitle: string;
  faqDescription: string | null;
  faq: StrapiFAQ[];
}

export interface StrapiCtaSection {
  id: number;
  ctaOverline: string | null;
  ctaTitle: string;
  ctaDescription: string | null;
}

export interface StrapiHome {
  id: number;
  documentId: string;
  heroOverline: string | null;
  heroTitle: string;
  heroDescription: string | null;
  numericSection: StrapiNumericSection;
  programsSection: StrapiProgramsSection;
  partnersSection: StrapiPartnersSection;
  testimonialsSection: StrapiTestimonialsSection;
  badgesSection: StrapiBadgesSection;
  faqSection: StrapiFaqSection;
  ctaSection: StrapiCtaSection;
}

export interface HomeData {
  heroOverline: string;
  heroTitle: string;
  heroDescription: string;
  numericSection: {
    students: string;
    bussiness: string;
    activePrograms: string;
    mediaRating: string;
  };
  programsSection: {
    programsOverline: string;
    programsTitle: string;
  };
  partnersSection: {
    partnersOverline: string;
    partnersTitle: string;
    partnersLogos: { url: string; alt: string }[];
    partnersDescription: string;
  };
  testimonialsSection: {
    testimonialsOverline: string;
    testimonialsTitle: string;
    testimonials: { text: string; name: string; role: string }[];
  };
  badgesSection: {
    badgesOverline: string;
    badgesTitle: string;
    badgesDescription: string;
  };
  faqSection: {
    faqOverline: string;
    faqTitle: string;
    faqDescription: string;
    faqs: { question: string; answer: string }[];
  };
  ctaSection: {
    ctaOverline: string;
    ctaTitle: string;
    ctaDescription: string;
  };
}

// ============ Maxymia Home Types (Single Type) ============

export interface StrapiMaxymiaHero {
  id: number;
  overline: string | null;
  title: string | null;
  description: string | null;
}

interface StrapiMaxymiaCard {
  id: number;
  title: string | null;
  description: string | null;
  image: StrapiMedia | null;
}

export interface StrapiMaxymiaCardSection {
  id: number;
  overline: string | null;
  title: string;
  description: string | null;
  card: StrapiMaxymiaCard[];
}

export interface StrapiMaxymiaMasterSection {
  id: number;
  programsOverline: string | null;
  programsTitle: string | null;
  programsDescription: string | null;
}

export interface StrapiMaxymiaCtaSection {
  id: number;
  ctaOverline: string | null;
  ctaTitle: string;
  ctaDescription: string | null;
  logoMaxymia: StrapiMedia | null;
}

export interface StrapiMaxymiaHome {
  id: number;
  documentId: string;
  hero: StrapiMaxymiaHero | null;
  whatIsSection: StrapiMaxymiaCardSection | null;
  Courses: StrapiMaxymiaMasterSection | null;
  whyMaxymia: StrapiMaxymiaCardSection | null;
  ctaSection: StrapiMaxymiaCtaSection | null;
}

// Frontend types for Maxymia
export interface MaxymiaCard {
  title: string;
  description: string;
  image: string;
}

export interface MaxymiaCardSection {
  overline: string;
  title: string;
  description: string;
  cards: MaxymiaCard[];
}

export interface MaxymiaHomeData {
  hero: {
    overline: string;
    title: string;
    description: string;
  };
  whatIsSection: MaxymiaCardSection;
  coursesSection: {
    overline: string;
    title: string;
    description: string;
  };
  whyMaxymia: MaxymiaCardSection;
  ctaSection: {
    overline: string;
    title: string;
    description: string;
    logo: string;
  };
}

// ============ Hero Section Types (Single Types) ============

// Strapi Single Type for Hero Sections
export interface StrapiHeroSection {
  id: number;
  documentId: string;
  heroImage: StrapiMedia | null;
  heroOverline: string;
  heroTitle: string;
  heroDescription: string | null;
}

// Frontend type for Hero Sections
export interface HeroSection {
  heroImage: string;
  heroOverline: string;
  heroTitle: string;
  heroDescription: string;
}

// ============ Metadata Types (Single Type) ============

export interface StrapiSiteMetadata {
  id: number;
  documentId: string;
  metaTitle: string;
  metaDescription: string | null;
  keywords: string | null;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: StrapiMedia | null;
  ogType: 'website' | 'article' | 'profile' | 'product' | null;
  twitterCard: 'summary' | 'summary_large_image' | null;
  noIndex: boolean;
  favicon: StrapiMedia | null;
}

export interface SiteMetadata {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  noIndex: boolean;
  favicon: string;
}

// ============ Maxymia Course Types (GraphQL) ============

// Content blocks (dynamic zone — __typename discriminator)
export interface StrapiMaxymiaTextBlock {
  __typename: 'ComponentMaxymiaTextBlock';
  html: string;
}

export interface StrapiMaxymiaVideoBlock {
  __typename: 'ComponentMaxymiaVideoBlock';
  vimeoId: string | null;
  youtubeId: string | null;
  provider: 'vimeo' | 'youtube' | null;
  videoHash: string | null;
  title: string | null;
}

export interface StrapiMaxymiaImageBlock {
  __typename: 'ComponentMaxymiaImageBlock';
  image: { url: string };
  alt: string;
  caption: string | null;
}

export interface StrapiMaxymiaCodeBlock {
  __typename: 'ComponentMaxymiaCodeBlock';
  language: string;
  code: string;
  fileName: string | null;
}

export interface StrapiMaxymiaCalloutBlock {
  __typename: 'ComponentMaxymiaCalloutBlock';
  variant: 'info' | 'warning' | 'tip';
  title: string | null;
  content: string;
}

export interface StrapiMaxymiaDownloadFile {
  label: string;
  description: string | null;
  file: { url: string; name: string; mime: string; size: number } | null;
}

export interface StrapiMaxymiaDownloadBlock {
  __typename: 'ComponentMaxymiaDownloadBlock';
  title: string | null;
  description: string | null;
  files: StrapiMaxymiaDownloadFile[];
}

export type StrapiMaxymiaContentBlock =
  | StrapiMaxymiaTextBlock
  | StrapiMaxymiaVideoBlock
  | StrapiMaxymiaImageBlock
  | StrapiMaxymiaCodeBlock
  | StrapiMaxymiaCalloutBlock
  | StrapiMaxymiaDownloadBlock;

// Blog dynamic-zone components (REST shape — `__component` discriminator)
export interface StrapiBlogTextBlockRest {
  __component: 'maxymia.text-block';
  id: number;
  html: string;
}
export interface StrapiBlogImageBlockRest {
  __component: 'maxymia.image-block';
  id: number;
  image: StrapiMedia | null;
  alt: string;
  caption: string | null;
}
export interface StrapiBlogVideoBlockRest {
  __component: 'maxymia.video-block';
  id: number;
  vimeoId: string | null;
  youtubeId: string | null;
  provider: 'vimeo' | 'youtube' | null;
  videoHash: string | null;
  title: string | null;
}
export interface StrapiBlogCodeBlockRest {
  __component: 'maxymia.code-block';
  id: number;
  language: string;
  code: string;
  fileName: string | null;
}
export interface StrapiBlogCalloutBlockRest {
  __component: 'maxymia.callout-block';
  id: number;
  variant: 'info' | 'warning' | 'tip';
  title: string | null;
  content: string;
}
export interface StrapiBlogDownloadBlockRest {
  __component: 'maxymia.download-block';
  id: number;
  title: string | null;
  description: string | null;
  files: {
    label: string;
    description: string | null;
    file: StrapiMedia | null;
  }[];
}
export interface StrapiBlogEmbedBlockRest {
  __component: 'blog.embed-block';
  id: number;
  html: string;
  provider: string | null;
}

export type StrapiBlogBodyBlock =
  | StrapiBlogTextBlockRest
  | StrapiBlogImageBlockRest
  | StrapiBlogVideoBlockRest
  | StrapiBlogCodeBlockRest
  | StrapiBlogCalloutBlockRest
  | StrapiBlogDownloadBlockRest
  | StrapiBlogEmbedBlockRest;

// Exam question types (dynamic zone)
// Note: _en fields are nullable, JSON scalars come as parsed values
export interface StrapiMaxymiaSingleChoice {
  __typename: 'ComponentMaxymiaSingleChoice';
  id: string;
  question_es: string;
  question_en: string | null;
  options: { id: string; text_es: string; text_en: string | null }[];
  correctIndex: number;
}

export interface StrapiMaxymiaMultipleChoice {
  __typename: 'ComponentMaxymiaMultipleChoice';
  id: string;
  question_es: string;
  question_en: string | null;
  options: { id: string; text_es: string; text_en: string | null }[];
  correctIndices: number[]; // JSON scalar
}

export interface StrapiMaxymiaOrdering {
  __typename: 'ComponentMaxymiaOrdering';
  id: string;
  question_es: string;
  question_en: string | null;
  items: { id: string; text_es: string; text_en: string | null }[];
  correctOrder: number[]; // JSON scalar
}

export interface StrapiMaxymiaFillBlank {
  __typename: 'ComponentMaxymiaFillBlank';
  id: string;
  question_es: string;
  question_en: string | null;
  acceptedAnswers: string[]; // JSON scalar
}

export interface StrapiMaxymiaFreeText {
  __typename: 'ComponentMaxymiaFreeText';
  id: string;
  question_es: string;
  question_en: string | null;
  sampleAnswer_es: string | null;
  sampleAnswer_en: string | null;
}

export type StrapiMaxymiaExamQuestion =
  | StrapiMaxymiaSingleChoice
  | StrapiMaxymiaMultipleChoice
  | StrapiMaxymiaOrdering
  | StrapiMaxymiaFillBlank
  | StrapiMaxymiaFreeText;

// Structure types
// Note: blocks, lessons, topics, exams are Strapi components (use `id`, not `documentId`)
export interface StrapiMaxymiaTopic {
  id: string;
  title_es: string;
  title_en: string | null;
  anchorId: string;
  content: StrapiMaxymiaContentBlock[];
}

export interface StrapiMaxymiaLesson {
  id: string;
  title_es: string;
  title_en: string | null;
  content_es: StrapiMaxymiaContentBlock[] | null;
  content_en: StrapiMaxymiaContentBlock[] | null;
  estimatedMinutes: number | null;
  order: number;
  topics: StrapiMaxymiaTopic[] | null;
}

export interface StrapiMaxymiaExam {
  id: string;
  title_es: string;
  title_en: string | null;
  description_es: string | null;
  description_en: string | null;
  passingScore: number;
  questions: StrapiMaxymiaExamQuestion[];
}

export interface StrapiMaxymiaBlock {
  id: string;
  title_es: string;
  title_en: string | null;
  order: number;
  lessons: StrapiMaxymiaLesson[];
  exam: StrapiMaxymiaExam | null;
}

export interface StrapiMaxymiaInstructor {
  documentId: string;
  name: string;
  role: string;
  avatar: { url: string } | null;
}

export interface StrapiMaxymiaCourse {
  documentId: string;
  slug: string;
  title_es: string;
  title_en: string | null;
  description_es: string;
  description_en: string | null;
  image: { url: string; alternativeText: string | null } | null;
  blocks: StrapiMaxymiaBlock[];
  price: number;
  language: string | null;
  level: string;
  category: string;
  isPro: boolean | null;
  tags: string[] | null; // JSON scalar
  instructor: StrapiMaxymiaInstructor | null;
  thumbnailTitle?: string | null;
  publishedAt?: string;
  careers?: string | null;
  objectives?: string | null;
  audiences?: string | null;
}

// GraphQL response wrappers
export interface MaxymiaCoursesGraphQLResponse {
  maxymiaCourses_connection: {
    nodes: StrapiMaxymiaCourse[];
  };
}
