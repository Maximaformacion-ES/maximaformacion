import { unstable_cache } from 'next/cache';
import { strapiGraphQL, getStrapiMediaUrl } from './client';
import type {
  StrapiMaxymiaContentBlock,
  StrapiMaxymiaExamQuestion,
  StrapiMaxymiaExam,
  StrapiMaxymiaLesson,
  StrapiMaxymiaBlock,
  StrapiMaxymiaCourse,
  MaxymiaCoursesGraphQLResponse,
} from './types';
import type {
  ContentBlock,
  LocalizedContent,
  ExamQuestion,
  MaxymiaExam,
  MaxymiaLesson,
  MaxymiaBlock,
  MaxymiaCourse,
  MaxymiaCategory,
  MaxymiaLevel,
  Locale,
} from '@/app/maxymia/types';

// ============ GraphQL Queries ============

const MAXYMIA_COURSES_LIST_QUERY = `
  query MaxymiaCourses {
    maxymiaCourses_connection(pagination: { limit: -1 }, sort: ["publishedAt:desc"]) {
      nodes {
        documentId
        slug
        title_es
        title_en
        description_es
        description_en
        price
        language
        level
        category
        isPro
        haveDiscount
        tags
        image { url, alternativeText }
        thumbnailTitle
        publishedAt
        docentes { documentId, name, role, avatar { url }, avatarUrl }
        blocks {
          id
          title_es
          title_en
          order
          lessons {
            id
            title_es
            title_en
            estimatedMinutes
            order
            uid
            topics {
              uid
            }
          }
          exam { id }
          exams { id }
        }
      }
    }
  }
`;
// NOTE: durationHours/faqs are intentionally NOT requested in the LIST query.
// They feed the course ficha (detail), which fetches via the DETAIL query
// below. Keeping them out of the list keeps the home/catalog fetch decoupled
// from the maxymia-course schema rollout (a GraphQL query can't ask for a
// field the running Strapi doesn't have yet). Catalog cards fall back to the
// computed duration via maxymiaCourseAsProgram.

const MAXYMIA_COURSE_DETAIL_QUERY = `
  query MaxymiaCourseBySlug($slug: String!) {
    maxymiaCourses_connection(filters: { slug: { eq: $slug } }) {
      nodes {
        documentId
        slug
        title_es
        title_en
        description_es
        description_en
        price
        language
        level
        category
        isPro
        haveDiscount
        tags
        durationHours
        faqs { question, answer }
        comos { question, answer }
        badges { name, category, badge { url } }
        docentes { documentId, slug, name, role, roleDescription, avatar { url }, avatarUrl, bio, linkedin, email }
        institutions { name, logo { url } }
        image { url, alternativeText }
        thumbnailTitle
        publishedAt
        careers
        objectives
        audiences
        blocks {
          id
          title_es
          title_en
          order
          lessons {
            id
            title_es
            title_en
            content_es {
              __typename
              ... on ComponentMaxymiaTextBlock { html }
              ... on ComponentMaxymiaVideoBlock { vimeoId, videoHash, title }
              ... on ComponentMaxymiaImageBlock { image { url }, alt, caption }
              ... on ComponentMaxymiaCodeBlock { language, code, fileName }
              ... on ComponentMaxymiaCalloutBlock { variant, title, content }
              ... on ComponentMaxymiaDownloadBlock {
                title
                description
                files {
                  label
                  description
                  file { url, name, mime, size }
                }
              }
            }
            content_en {
              __typename
              ... on ComponentMaxymiaTextBlock { html }
              ... on ComponentMaxymiaVideoBlock { vimeoId, videoHash, title }
              ... on ComponentMaxymiaImageBlock { image { url }, alt, caption }
              ... on ComponentMaxymiaCodeBlock { language, code, fileName }
              ... on ComponentMaxymiaCalloutBlock { variant, title, content }
              ... on ComponentMaxymiaDownloadBlock {
                title
                description
                files {
                  label
                  description
                  file { url, name, mime, size }
                }
              }
            }
            estimatedMinutes
            order
            uid
            topics {
              id
              title_es
              title_en
              anchorId
              uid
              content {
                __typename
                ... on ComponentMaxymiaTextBlock { html }
                ... on ComponentMaxymiaVideoBlock { vimeoId, videoHash, title }
                ... on ComponentMaxymiaImageBlock { image { url }, alt, caption }
                ... on ComponentMaxymiaCodeBlock { language, code, fileName }
                ... on ComponentMaxymiaCalloutBlock { variant, title, content }
                ... on ComponentMaxymiaDownloadBlock {
                  title
                  description
                  files {
                    label
                    description
                    file { url, name, mime, size }
                  }
                }
              }
            }
          }
          exam {
            id
            title_es
            title_en
            description_es
            description_en
            passingScore
            questions {
              __typename
              ... on ComponentMaxymiaSingleChoice { id, question_es, question_en, options { id, text_es, text_en }, correctIndex, explanation_es, explanation_en }
              ... on ComponentMaxymiaMultipleChoice { id, question_es, question_en, options { id, text_es, text_en }, correctIndices, explanation_es, explanation_en }
              ... on ComponentMaxymiaOrdering { id, question_es, question_en, items { id, text_es, text_en }, correctOrder, explanation_es, explanation_en }
              ... on ComponentMaxymiaFillBlank { id, question_es, question_en, acceptedAnswers, explanation_es, explanation_en }
              ... on ComponentMaxymiaFreeText { id, question_es, question_en, sampleAnswer_es, sampleAnswer_en, explanation_es, explanation_en }
            }
          }
          exams {
            id
            title_es
            title_en
            description_es
            description_en
            passingScore
            questions {
              __typename
              ... on ComponentMaxymiaSingleChoice { id, question_es, question_en, options { id, text_es, text_en }, correctIndex, explanation_es, explanation_en }
              ... on ComponentMaxymiaMultipleChoice { id, question_es, question_en, options { id, text_es, text_en }, correctIndices, explanation_es, explanation_en }
              ... on ComponentMaxymiaOrdering { id, question_es, question_en, items { id, text_es, text_en }, correctOrder, explanation_es, explanation_en }
              ... on ComponentMaxymiaFillBlank { id, question_es, question_en, acceptedAnswers, explanation_es, explanation_en }
              ... on ComponentMaxymiaFreeText { id, question_es, question_en, sampleAnswer_es, sampleAnswer_en, explanation_es, explanation_en }
            }
          }
        }
      }
    }
  }
`;

// ============ Transform Functions ============

function transformContentBlock(block: StrapiMaxymiaContentBlock): ContentBlock {
  switch (block.__typename) {
    case 'ComponentMaxymiaTextBlock':
      return { type: 'text', html: block.html };
    case 'ComponentMaxymiaVideoBlock':
      return {
        type: 'video',
        provider: block.provider ?? (block.youtubeId ? 'youtube' : 'vimeo'),
        vimeoId: block.vimeoId ?? undefined,
        youtubeId: block.youtubeId ?? undefined,
        videoHash: block.videoHash ?? undefined,
        title: block.title ?? undefined,
      };
    case 'ComponentMaxymiaImageBlock':
      return {
        type: 'image',
        src: getStrapiMediaUrl(block.image),
        alt: block.alt,
        caption: block.caption ?? undefined,
      };
    case 'ComponentMaxymiaCodeBlock':
      return {
        type: 'code',
        language: block.language,
        code: block.code,
        fileName: block.fileName ?? undefined,
      };
    case 'ComponentMaxymiaCalloutBlock':
      return {
        type: 'callout',
        variant: block.variant,
        title: block.title ?? undefined,
        content: block.content,
      };
    case 'ComponentMaxymiaDownloadBlock':
      return {
        type: 'download',
        title: block.title ?? undefined,
        description: block.description ?? undefined,
        files: (block.files ?? [])
          .filter((f) => f.file)
          .map((f) => ({
            label: f.label,
            description: f.description ?? undefined,
            url: getStrapiMediaUrl(f.file),
            name: f.file!.name,
            mime: f.file!.mime,
            sizeKB: f.file!.size,
          })),
      };
  }
}

/**
 * Build LocalizedContent from optional topics.
 * topics[] contain ContentBlocks that are appended to both locales.
 */
function transformLocalizedContent(
  topics?: StrapiMaxymiaLesson['topics']
): LocalizedContent {
  const blocks: ContentBlock[] = [];

  if (topics) {
    for (const topic of topics) {
      const topicBlocks = (topic.content ?? []).map(transformContentBlock);
      blocks.push(...topicBlocks);
    }
  }

  return { es: blocks, en: blocks };
}

/**
 * Lesson intro blocks (lesson.content_es/_en dynamic zone).
 */
function transformLessonIntro(lesson: StrapiMaxymiaLesson): LocalizedContent {
  const introEs = (lesson.content_es ?? []).map(transformContentBlock);
  const introEn = (lesson.content_en ?? lesson.content_es ?? []).map(
    transformContentBlock
  );
  return { es: introEs, en: introEn };
}

function transformExplanation(
  es: string | null,
  en: string | null
): { es: string; en: string } | null {
  if (!es && !en) return null;
  return { es: es ?? en ?? '', en: en ?? es ?? '' };
}

function transformExamQuestion(q: StrapiMaxymiaExamQuestion): ExamQuestion {
  switch (q.__typename) {
    case 'ComponentMaxymiaSingleChoice':
      return {
        type: 'single_choice',
        id: q.id,
        question: { es: q.question_es, en: q.question_en ?? q.question_es },
        options: (q.options ?? []).map((o) => ({ es: o.text_es, en: o.text_en ?? o.text_es })),
        correctIndex: q.correctIndex,
        explanation: transformExplanation(q.explanation_es, q.explanation_en),
      };
    case 'ComponentMaxymiaMultipleChoice':
      return {
        type: 'multiple_choice',
        id: q.id,
        question: { es: q.question_es, en: q.question_en ?? q.question_es },
        options: (q.options ?? []).map((o) => ({ es: o.text_es, en: o.text_en ?? o.text_es })),
        correctIndices: Array.isArray(q.correctIndices) ? q.correctIndices : [],
        explanation: transformExplanation(q.explanation_es, q.explanation_en),
      };
    case 'ComponentMaxymiaOrdering':
      return {
        type: 'ordering',
        id: q.id,
        question: { es: q.question_es, en: q.question_en ?? q.question_es },
        items: (q.items ?? []).map((i) => ({ es: i.text_es, en: i.text_en ?? i.text_es })),
        correctOrder: Array.isArray(q.correctOrder) ? q.correctOrder : [],
        explanation: transformExplanation(q.explanation_es, q.explanation_en),
      };
    case 'ComponentMaxymiaFillBlank':
      return {
        type: 'fill_blank',
        id: q.id,
        question: { es: q.question_es, en: q.question_en ?? q.question_es },
        blanks: [{ acceptedAnswers: Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers : [] }],
        explanation: transformExplanation(q.explanation_es, q.explanation_en),
      };
    case 'ComponentMaxymiaFreeText':
      return {
        type: 'free_text',
        id: q.id,
        question: { es: q.question_es, en: q.question_en ?? q.question_es },
        sampleAnswer: { es: q.sampleAnswer_es ?? '', en: q.sampleAnswer_en ?? '' },
        explanation: transformExplanation(q.explanation_es, q.explanation_en),
      };
  }
}

function transformExam(exam: StrapiMaxymiaExam): MaxymiaExam {
  return {
    id: exam.id,
    title: { es: exam.title_es, en: exam.title_en ?? exam.title_es },
    description: exam.description_es || exam.description_en
      ? { es: exam.description_es ?? '', en: exam.description_en ?? '' }
      : undefined,
    passingScore: exam.passingScore,
    questions: (exam.questions ?? []).map(transformExamQuestion),
  };
}

/**
 * Stable, content-derived lesson id used everywhere as the lesson's identity
 * (progress key, completion checks, navigation, URLs). We deliberately do NOT
 * use the Strapi component `id`: repeatable-component ids regenerate on every
 * save/re-import of the course, which orphaned the stored progress and reset
 * the student to "sin empezar". A slug from block+lesson title survives both
 * re-imports and admin edits (only changes if the title itself is edited).
 */
function lessonStableId(lesson: StrapiMaxymiaLesson, blockSlug: string): string {
  const lessonSlug = slugify(lesson.title_es) || `l${lesson.order ?? 0}`;
  return `${blockSlug}__${lessonSlug}`;
}

function slugify(text: string | null | undefined): string {
  return (text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function transformLesson(lesson: StrapiMaxymiaLesson, blockSlug: string): MaxymiaLesson {
  const stableId = lessonStableId(lesson, blockSlug);
  return {
    id: stableId,
    // Durable per-unit id. Prefer the CMS-assigned `uid` (stable across saves
    // and renames); fall back to a content-derived id only until the course is
    // re-saved once and the lifecycle hook populates the real uids.
    uid: lesson.uid || stableId,
    title: { es: lesson.title_es, en: lesson.title_en ?? lesson.title_es },
    description: { es: '', en: '' },
    intro: transformLessonIntro(lesson),
    content: transformLocalizedContent(lesson.topics),
    estimatedMinutes: lesson.estimatedMinutes ?? 0,
    topics: (lesson.topics ?? []).map((t, ti) => {
      const topicBlocks = (t.content ?? []).map(transformContentBlock);
      return {
        id: String(t.id),
        // Prefer the CMS uid. The fallback is index-based (NOT title-based) so the
        // lean list query — which doesn't fetch topic titles — derives the same
        // ids as the detail query until the real uids are populated by a save.
        uid: t.uid || `${stableId}__t${ti}`,
        title: { es: t.title_es, en: t.title_en ?? t.title_es },
        anchorId: t.anchorId,
        // Each topic keeps its OWN content. Previously this was dropped and the
        // player re-split the lesson's flat content evenly across topics, which
        // mis-assigned blocks to the wrong topic (content bleeding into the
        // previous unit). The blocks are locale-agnostic (same as the flat
        // mapping in transformLocalizedContent), so both locales share them.
        content: { es: topicBlocks, en: topicBlocks },
      };
    }),
  };
}

function transformBlock(block: StrapiMaxymiaBlock): MaxymiaBlock {
  const sortedLessons = [...(block.lessons ?? [])].sort((a, b) => a.order - b.order);
  const examsArray =
    block.exams && block.exams.length > 0
      ? block.exams
      : block.exam
        ? [block.exam]
        : [];
  const blockSlug = slugify(block.title_es) || `b${block.order ?? 0}`;
  return {
    id: String(block.id),
    title: { es: block.title_es, en: block.title_en ?? block.title_es },
    content: transformLocalizedContent(),
    lessons: sortedLessons.map((l) => transformLesson(l, blockSlug)),
    exams: examsArray.map(transformExam),
  };
}

function transformCourse(course: StrapiMaxymiaCourse): MaxymiaCourse {
  const sortedBlocks = [...(course.blocks ?? [])].sort((a, b) => a.order - b.order);
  return {
    id: course.documentId,
    slug: course.slug,
    title: { es: course.title_es, en: course.title_en ?? course.title_es },
    description: { es: course.description_es, en: course.description_en ?? course.description_es },
    image: getStrapiMediaUrl(course.image),
    blocks: sortedBlocks.map(transformBlock),
    price: course.price,
    language: (course.language ?? 'es') as Locale | 'bilingual',
    // El "instructor" (chip del hero/cards/certificado) se deriva del primer
    // docente (relación `author`); ya no existe el campo instructor en Strapi.
    instructor: {
      name: course.docentes?.[0]?.name ?? '',
      role: course.docentes?.[0]?.role ?? '',
      avatar: course.docentes?.[0]?.avatar
        ? getStrapiMediaUrl(course.docentes[0].avatar)
        : course.docentes?.[0]?.avatarUrl ?? undefined,
    },
    docentes: (course.docentes ?? []).map((d) => ({
      documentId: d.documentId,
      slug: d.slug ?? undefined,
      name: d.name,
      role: d.role,
      roleDescription: d.roleDescription ?? undefined,
      avatar: d.avatar ? getStrapiMediaUrl(d.avatar) : d.avatarUrl ?? undefined,
      bio: d.bio ?? undefined,
      linkedin: d.linkedin ?? undefined,
      email: d.email ?? undefined,
    })),
    level: course.level as MaxymiaLevel,
    isPro: course.isPro ?? false,
    haveDiscount: course.haveDiscount ?? false,
    tags: course.tags ?? [],
    category: course.category as MaxymiaCategory,
    thumbnailTitle: course.thumbnailTitle
      ? { es: course.thumbnailTitle, en: course.thumbnailTitle }
      : undefined,
    createdAt: course.publishedAt,
    careers: course.careers ?? undefined,
    objectives: course.objectives ?? undefined,
    audiences: course.audiences ?? undefined,
    durationHours: course.durationHours ?? undefined,
    faqs: course.faqs?.length
      ? course.faqs.map((f) => ({ question: f.question, answer: f.answer }))
      : undefined,
    comos: course.comos?.length
      ? course.comos.map((c) => ({ question: c.question, answer: c.answer }))
      : undefined,
    badges: course.badges?.length
      ? course.badges
          .filter((b) => b.badge?.url)
          .map((b) => ({ name: b.name, imageUrl: getStrapiMediaUrl(b.badge), category: b.category ?? null }))
      : undefined,
    institutions: course.institutions?.length
      ? course.institutions
          .filter((i) => i.logo?.url)
          .map((i) => ({ name: i.name, imageUrl: getStrapiMediaUrl(i.logo) }))
      : undefined,
  };
}

// ============ Fetch Functions ============

export async function getMaxymiaCoursesFromStrapi(): Promise<MaxymiaCourse[]> {
  const data = await strapiGraphQL<MaxymiaCoursesGraphQLResponse>(
    MAXYMIA_COURSES_LIST_QUERY,
    undefined,
    { revalidate: 60, tags: ['maxymia-courses'] }
  );
  return data.maxymiaCourses_connection.nodes.map(transformCourse);
}

export async function getMaxymiaCourseBySlugFromStrapi(
  slug: string
): Promise<MaxymiaCourse | null> {
  // Cachear el curso completo por slug. Cada navegación entre lecciones vuelve a
  // pedir el MISMO curso (query grande al Strapi self-hosted, por VPN). El Data
  // Cache de Next no cachea POST de forma fiable, así que memoizamos el resultado
  // con unstable_cache: misma curso = 1 fetch y luego cache-hit. Revalida a los
  // 60s y por tags (el webhook de Strapi ya revalida 'maxymia-courses').
  const load = unstable_cache(
    async (s: string): Promise<MaxymiaCourse | null> => {
      const data = await strapiGraphQL<MaxymiaCoursesGraphQLResponse>(
        MAXYMIA_COURSE_DETAIL_QUERY,
        { slug: s }
      );
      const node = data.maxymiaCourses_connection.nodes[0];
      if (!node) return null;
      return transformCourse(node);
    },
    ['maxymia-course-detail', slug],
    { revalidate: 60, tags: ['maxymia-courses', `maxymia-course-${slug}`] }
  );
  return load(slug);
}
