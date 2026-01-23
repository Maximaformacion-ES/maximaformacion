/**
 * Migration script to populate Strapi CMS with existing data
 * Run: npx ts-node --skip-project scripts/migrate-to-strapi.ts
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('Error: STRAPI_API_TOKEN environment variable is required');
  process.exit(1);
}

// Sample programs data
const PROGRAMS = [
  {
    title: 'Máster en Inteligencia Artificial Aplicada',
    slug: 'master-en-inteligencia-artificial-aplicada',
    type: 'Master',
    duration: '1500h',
    ects: '60 ECTS',
    tags: ['Tecnología', 'Innovación'],
    featured: true,
    isPro: true,
    description: 'Domina las técnicas más avanzadas de IA y Machine Learning para aplicarlas en proyectos reales.',
    longDescription: 'Este máster te prepara para liderar proyectos de inteligencia artificial en empresas tecnológicas.',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80',
    format: 'Online',
    language: 'Español',
    startDate: 'Octubre 2024',
    certification: 'Título Propio Universidad',
    price: 2499,
    originalPrice: 3499,
    modules: [
      { title: 'Fundamentos de IA', description: 'Conceptos básicos de IA', hours: 150, topics: ['Historia de la IA', 'Tipos de aprendizaje'] },
      { title: 'Machine Learning', description: 'Algoritmos supervisados y no supervisados', hours: 200, topics: ['Regresión', 'Clustering'] },
    ],
    audience: ['Ingenieros de software', 'Profesionales de datos'],
    careers: ['AI Engineer', 'ML Engineer', 'Data Scientist'],
    objectives: ['Dominar algoritmos de ML', 'Implementar soluciones de deep learning'],
  },
  {
    title: 'Máster en Dirección de Ciberseguridad',
    slug: 'master-en-direccion-de-ciberseguridad',
    type: 'Master',
    duration: '1500h',
    ects: '60 ECTS',
    tags: ['Seguridad', 'Gestión'],
    featured: true,
    isPro: true,
    description: 'Lidera la estrategia de seguridad informática en organizaciones de cualquier tamaño.',
    longDescription: 'Formación ejecutiva para profesionales que buscan dirigir equipos de ciberseguridad.',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80',
    format: 'Online',
    language: 'Español',
    startDate: 'Noviembre 2024',
    certification: 'Título Propio Universidad',
    price: 2499,
    originalPrice: 3499,
    modules: [
      { title: 'Fundamentos de Ciberseguridad', description: 'Principios básicos', hours: 150, topics: ['Amenazas', 'Vulnerabilidades'] },
    ],
    audience: ['IT Managers', 'CTOs'],
    careers: ['CISO', 'Security Manager'],
    objectives: ['Diseñar estrategias de ciberseguridad'],
  },
  {
    title: 'Experto en Big Data & Analytics',
    slug: 'experto-en-big-data-analytics',
    type: 'Curso',
    duration: '750h',
    ects: '30 ECTS',
    tags: ['Data', 'Analítica'],
    featured: false,
    isPro: false,
    description: 'Especialízate en el análisis de grandes volúmenes de datos.',
    longDescription: 'Curso intensivo de big data con Hadoop, Spark y herramientas de visualización.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    format: 'Online',
    language: 'Español',
    startDate: 'Enero 2025',
    certification: 'Certificado de Experto',
    price: 1299,
    originalPrice: 1999,
    modules: [
      { title: 'Fundamentos de Big Data', description: 'Sistemas distribuidos', hours: 100, topics: ['Hadoop', 'HDFS'] },
    ],
    audience: ['Analistas de datos', 'Desarrolladores'],
    careers: ['Big Data Engineer', 'Data Analyst'],
    objectives: ['Dominar tecnologías de big data'],
  },
];

// Sample blog posts data
const BLOG_POSTS = [
  {
    title: 'Introducción al Análisis Estadístico con R',
    slug: 'introduccion-analisis-estadistico-r',
    excerpt: 'Descubre cómo R Software se ha convertido en la herramienta líder para análisis estadístico.',
    content: '<h2>¿Qué es R Software?</h2><p>R es un lenguaje de programación para análisis estadístico y visualización de datos.</p>',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    category: 'R Software',
    author: { name: 'Dr. María González', role: 'Directora de Análisis Estadístico' },
    readTime: '8 min',
    tags: ['R Software', 'Estadística', 'Tutorial'],
    featured: true,
  },
  {
    title: 'Big Data y Data Mining: Técnicas Avanzadas',
    slug: 'big-data-data-mining-tecnicas-avanzadas',
    excerpt: 'Explora cómo las técnicas de Big Data pueden transformar tu empresa.',
    content: '<h2>El Poder del Big Data</h2><p>Las empresas generan volúmenes masivos de datos cada día.</p>',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    category: 'Data Science',
    author: { name: 'Carlos Martínez', role: 'Consultor Senior en Big Data' },
    readTime: '12 min',
    tags: ['Big Data', 'Data Mining', 'Empresas'],
    featured: true,
  },
  {
    title: 'Análisis Predictivo para Negocios',
    slug: 'analisis-predictivo-negocios',
    excerpt: 'Los modelos predictivos están cambiando la forma en que las empresas planifican.',
    content: '<h2>¿Qué es el Análisis Predictivo?</h2><p>El análisis predictivo utiliza datos históricos para predecir resultados futuros.</p>',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    category: 'Data Science',
    author: { name: 'Ana Rodríguez', role: 'Especialista en Machine Learning' },
    readTime: '10 min',
    tags: ['Predictivo', 'Machine Learning', 'Negocio'],
    featured: false,
  },
];

async function createEntry(contentType: string, data: Record<string, unknown>): Promise<{ data?: { id: number }; error?: unknown }> {
  const response = await fetch(`${STRAPI_URL}/api/${contentType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    body: JSON.stringify({ data }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error(`  Failed:`, JSON.stringify(result, null, 2));
    return { error: result };
  }

  return result;
}

async function main() {
  console.log('Starting migration to Strapi...');
  console.log(`Strapi URL: ${STRAPI_URL}\n`);

  // Migrate Programs
  console.log('=== Migrating Programs ===\n');
  for (const program of PROGRAMS) {
    console.log(`Creating: ${program.title}`);
    const result = await createEntry('programs', program);
    if (result.data) {
      console.log(`  ✓ Created (ID: ${result.data.id})`);
    }
  }

  // Migrate Blog Posts
  console.log('\n=== Migrating Blog Posts ===\n');
  for (const post of BLOG_POSTS) {
    console.log(`Creating: ${post.title}`);
    const result = await createEntry('blog-posts', post);
    if (result.data) {
      console.log(`  ✓ Created (ID: ${result.data.id})`);
    }
  }

  console.log('\n=== Migration Complete ===\n');
}

main().catch(console.error);
