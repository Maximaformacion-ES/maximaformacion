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
        tags
        image { url, alternativeText }
        thumbnailTitle
        publishedAt
        instructor { documentId, name, role, avatar { url } }
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
          }
          exam { id }
        }
      }
    }
  }
`;

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
        tags
        image { url, alternativeText }
        thumbnailTitle
        publishedAt
        careers
        objectives
        audiences
        instructor { documentId, name, role, avatar { url } }
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
            topics {
              id
              title_es
              title_en
              anchorId
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
              ... on ComponentMaxymiaSingleChoice { id, question_es, question_en, options { id, text_es, text_en }, correctIndex }
              ... on ComponentMaxymiaMultipleChoice { id, question_es, question_en, options { id, text_es, text_en }, correctIndices }
              ... on ComponentMaxymiaOrdering { id, question_es, question_en, items { id, text_es, text_en }, correctOrder }
              ... on ComponentMaxymiaFillBlank { id, question_es, question_en, acceptedAnswers }
              ... on ComponentMaxymiaFreeText { id, question_es, question_en, sampleAnswer_es, sampleAnswer_en }
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

function transformExamQuestion(q: StrapiMaxymiaExamQuestion): ExamQuestion {
  switch (q.__typename) {
    case 'ComponentMaxymiaSingleChoice':
      return {
        type: 'single_choice',
        id: q.id,
        question: { es: q.question_es, en: q.question_en ?? q.question_es },
        options: q.options.map((o) => ({ es: o.text_es, en: o.text_en ?? o.text_es })),
        correctIndex: q.correctIndex,
      };
    case 'ComponentMaxymiaMultipleChoice':
      return {
        type: 'multiple_choice',
        id: q.id,
        question: { es: q.question_es, en: q.question_en ?? q.question_es },
        options: q.options.map((o) => ({ es: o.text_es, en: o.text_en ?? o.text_es })),
        correctIndices: q.correctIndices,
      };
    case 'ComponentMaxymiaOrdering':
      return {
        type: 'ordering',
        id: q.id,
        question: { es: q.question_es, en: q.question_en ?? q.question_es },
        items: q.items.map((i) => ({ es: i.text_es, en: i.text_en ?? i.text_es })),
        correctOrder: q.correctOrder,
      };
    case 'ComponentMaxymiaFillBlank':
      return {
        type: 'fill_blank',
        id: q.id,
        question: { es: q.question_es, en: q.question_en ?? q.question_es },
        blanks: [{ acceptedAnswers: q.acceptedAnswers }],
      };
    case 'ComponentMaxymiaFreeText':
      return {
        type: 'free_text',
        id: q.id,
        question: { es: q.question_es, en: q.question_en ?? q.question_es },
        sampleAnswer: { es: q.sampleAnswer_es ?? '', en: q.sampleAnswer_en ?? '' },
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

function transformLesson(lesson: StrapiMaxymiaLesson): MaxymiaLesson {
  return {
    id: String(lesson.id),
    title: { es: lesson.title_es, en: lesson.title_en ?? lesson.title_es },
    description: { es: '', en: '' },
    intro: transformLessonIntro(lesson),
    content: transformLocalizedContent(lesson.topics),
    estimatedMinutes: lesson.estimatedMinutes ?? 0,
    topics: (lesson.topics ?? []).map((t) => ({
      id: String(t.id),
      title: { es: t.title_es, en: t.title_en ?? t.title_es },
      anchorId: t.anchorId,
    })),
  };
}

function transformBlock(block: StrapiMaxymiaBlock): MaxymiaBlock {
  const sortedLessons = [...(block.lessons ?? [])].sort((a, b) => a.order - b.order);
  return {
    id: String(block.id),
    title: { es: block.title_es, en: block.title_en ?? block.title_es },
    content: transformLocalizedContent(),
    lessons: sortedLessons.map(transformLesson),
    exam: block.exam ? transformExam(block.exam) : undefined,
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
    instructor: {
      name: course.instructor?.name ?? '',
      role: course.instructor?.role ?? '',
      avatar: course.instructor?.avatar ? getStrapiMediaUrl(course.instructor.avatar) : undefined,
    },
    level: course.level as MaxymiaLevel,
    isPro: course.isPro ?? false,
    tags: course.tags ?? [],
    category: course.category as MaxymiaCategory,
    thumbnailTitle: course.thumbnailTitle
      ? { es: course.thumbnailTitle, en: course.thumbnailTitle }
      : undefined,
    createdAt: course.publishedAt,
    careers: course.careers ?? undefined,
    objectives: course.objectives ?? undefined,
    audiences: course.audiences ?? undefined,
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
  const data = await strapiGraphQL<MaxymiaCoursesGraphQLResponse>(
    MAXYMIA_COURSE_DETAIL_QUERY,
    { slug },
    { revalidate: 60, tags: ['maxymia-courses', `maxymia-course-${slug}`] }
  );
  const node = data.maxymiaCourses_connection.nodes[0];
  if (!node) return null;
  return transformCourse(node);
}
