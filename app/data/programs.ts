interface ProgramUnit {
  title: string;
}

interface ProgramModule {
  title: string;
  description: string;
  hours: number;
  units?: ProgramUnit[];
}

interface Topic {
  id: number;
  documentId: string;
  name: string;
}

interface Program {
  id: number;
  type: 'Master' | 'Curso';
  title: string;
  duration: number;
  slug: string;
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
  isPro: boolean; // Whether this program requires Pro subscription
}

const ALL_PROGRAMS: Partial<Program>[] = [
  { 
    id: 1, 
    type: 'Master', 
    title: 'Máster en Inteligencia Artificial Aplicada', 
    duration: 1500, 
    ects: 60, 
    tags: ['Tecnología', 'Innovación'], 
    featured: true,
    isPro: true, // Pro-only program
    description: 'Domina las técnicas más avanzadas de IA y Machine Learning para aplicarlas en proyectos reales.',
    longDescription: 'Este máster te prepara para liderar proyectos de inteligencia artificial en empresas tecnológicas. Aprenderás desde los fundamentos hasta las técnicas más avanzadas de deep learning, procesamiento de lenguaje natural y visión por computadora.',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80',
    format: 'Online',
    language: 'Español',
    startDate: 'Octubre 2024',
    certification: 'Título Propio Universidad',
    price: 2499,
    originalPrice: 3499,
    modules: [
      {
        title: 'Fundamentos de Inteligencia Artificial',
        description: 'Introducción a los conceptos básicos de IA y sus aplicaciones',
        hours: 150,
        units: [{ title: 'Historia de la IA' }, { title: 'Tipos de aprendizaje' }, { title: 'Ética en IA' }, { title: 'Casos de uso empresariales' }]
      },
      {
        title: 'Machine Learning Avanzado',
        description: 'Algoritmos supervisados y no supervisados, ensemble methods',
        hours: 200,
        units: [{ title: 'Regresión y clasificación' }, { title: 'Random Forest' }, { title: 'Gradient Boosting' }, { title: 'Clustering' }]
      },
      {
        title: 'Deep Learning y Redes Neuronales',
        description: 'Arquitecturas profundas y frameworks modernos',
        hours: 250,
        units: [{ title: 'TensorFlow y PyTorch' }, { title: 'CNNs' }, { title: 'RNNs y LSTM' }, { title: 'Transformers' }]
      },
      {
        title: 'Proyecto Final',
        description: 'Desarrollo de un proyecto completo de IA aplicada',
        hours: 300,
        units: [{ title: 'Diseño de solución' }, { title: 'Implementación' }, { title: 'Despliegue' }, { title: 'Presentación' }]
      }
    ],
    topics: [{ id: 1, documentId: 'local-1', name: 'Inteligencia Artificial' }],
    audience: `- Ingenieros de software con experiencia en programación
- Profesionales de datos que quieren especializarse en IA
- Directivos tecnológicos que necesitan entender IA
- Emprendedores en el sector tech`,
    careers: `- AI Engineer
- Machine Learning Engineer
- Data Scientist especializado en IA
- AI Product Manager
- Investigador en IA`,
    objectives: `- Dominar los algoritmos de machine learning más utilizados en la industria
- Implementar soluciones de deep learning con frameworks modernos
- Desplegar modelos de IA en producción
- Entender las implicaciones éticas y legales de la IA`
  },
  { 
    id: 2, 
    type: 'Master', 
    title: 'Máster en Dirección de Ciberseguridad', 
    duration: 1500, 
    ects: 60, 
    tags: ['Seguridad', 'Gestión'], 
    featured: true,
    isPro: true, // Pro-only program
    description: 'Lidera la estrategia de seguridad informática en organizaciones de cualquier tamaño.',
    longDescription: 'Formación ejecutiva para profesionales que buscan dirigir equipos de ciberseguridad y diseñar estrategias de protección para empresas. Combina aspectos técnicos y de gestión.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80',
    format: 'Online',
    language: 'Español',
    startDate: 'Noviembre 2024',
    certification: 'Título Propio Universidad',
    price: 2499,
    originalPrice: 3499,
    modules: [
      {
        title: 'Fundamentos de Ciberseguridad',
        description: 'Principios básicos y amenazas actuales',
        hours: 150,
        units: [{ title: 'Tipos de amenazas' }, { title: 'Vulnerabilidades comunes' }, { title: 'Marco legal' }, { title: 'Estándares ISO' }]
      },
      {
        title: 'Gestión de Seguridad',
        description: 'Diseño e implementación de políticas de seguridad',
        hours: 200,
        units: [{ title: 'Risk Management' }, { title: 'Compliance' }, { title: 'Incident Response' }, { title: 'Business Continuity' }]
      }
    ],
    topics: [{ id: 2, documentId: 'local-2', name: 'Ciberseguridad' }],
    audience: `- IT Managers y CTOs
- Profesionales de seguridad con experiencia técnica
- Auditores de seguridad
- Consultores en ciberseguridad`,
    careers: `- CISO (Chief Information Security Officer)
- Security Manager
- Cybersecurity Consultant
- Risk Manager
- Compliance Officer`,
    objectives: `- Diseñar estrategias de ciberseguridad corporativas
- Gestionar equipos de seguridad
- Implementar frameworks de compliance
- Responder a incidentes de seguridad`
  },
  { 
    id: 3, 
    type: 'Curso', 
    title: 'Experto en Big Data & Analytics', 
    duration: 200, 
    ects: 30, 
    tags: ['Data', 'Analítica'], 
    featured: false,
    description: 'Especialízate en el análisis de grandes volúmenes de datos con herramientas empresariales.',
    longDescription: 'Curso intensivo que te prepara para trabajar con tecnologías de big data como Hadoop, Spark y herramientas de visualización de datos.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    format: 'Online',
    language: 'Español',
    startDate: 'Enero 2025',
    certification: 'Certificado de Experto',
    price: 1299,
    originalPrice: 1999,
    modules: [
      {
        title: 'Fundamentos de Big Data',
        description: 'Introducción a los sistemas distribuidos y almacenamiento',
        hours: 100,
        units: [{ title: 'Hadoop Ecosystem' }, { title: 'HDFS' }, { title: 'MapReduce' }, { title: 'YARN' }]
      },
      {
        title: 'Procesamiento con Spark',
        description: 'Análisis de datos con Apache Spark',
        hours: 150,
        units: [{ title: 'Spark Core' }, { title: 'Spark SQL' }, { title: 'Streaming' }, { title: 'MLlib' }]
      }
    ],
    topics: [{ id: 3, documentId: 'local-3', name: 'Big Data' }],
    audience: `- Analistas de datos
- Desarrolladores que quieren especializarse en big data
- Profesionales de business intelligence`,
    careers: `- Big Data Engineer
- Data Analyst
- Business Intelligence Analyst
- Data Architect`,
    objectives: `- Dominar tecnologías de big data
- Procesar grandes volúmenes de datos
- Crear pipelines de datos
- Visualizar insights de negocio`
  },
  { 
    id: 4, 
    type: 'Master', 
    title: 'MBA en Transformación Digital', 
    duration: 1500, 
    ects: 60, 
    tags: ['Negocios', 'Digital'], 
    featured: false 
  },
  { 
    id: 5, 
    type: 'Curso', 
    title: 'Especialización en Cloud Computing', 
    duration: 500, 
    ects: 20, 
    tags: ['Tecnología', 'Cloud'], 
    featured: false 
  },
  { 
    id: 6, 
    type: 'Master', 
    title: 'Máster en Marketing Digital Avanzado', 
    duration: 1500, 
    ects: 60, 
    tags: ['Marketing', 'Digital'], 
    featured: true 
  },
  { 
    id: 7, 
    type: 'Curso', 
    title: 'Python para Data Science', 
    duration: 200, 
    ects: 8, 
    tags: ['Programación', 'Data'], 
    featured: false 
  },
  { 
    id: 8, 
    type: 'Master', 
    title: 'Máster en Gestión de Proyectos Ágiles', 
    duration: 1500, 
    ects: 60, 
    tags: ['Gestión', 'Agile'], 
    featured: false 
  },
  { 
    id: 9, 
    type: 'Curso', 
    title: 'UX/UI Design Fundamentals', 
    duration: 400, 
    ects: 16, 
    tags: ['Diseño', 'Producto'], 
    featured: false 
  },
];

const CATEGORIES = ['Todos', 'Master', 'Curso'] as const;

// Helper function to get program by ID
const getProgramById = (id: number): Program | undefined => {
  return COMPLETE_PROGRAMS.find(p => p.id === id);
};

// Helper to generate slug from title (without accents)
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Remove consecutive dashes
    .trim();
};

// Helper function to get default program data (for programs without full details)
const getDefaultProgramData = (base: Partial<Program>): Program => ({
  ...base,
  id: base.id!,
  type: base.type!,
  title: base.title!,
  slug: base.slug || generateSlug(base.title!),
  duration: base.duration!,
  ects: base.ects!,
  tags: base.tags!,
  featured: base.featured ?? false,
  isPro: base.isPro ?? false, // Default to free program
  description: base.description || `${base.title} - Formación especializada de alta calidad.`,
  longDescription: base.longDescription || `Este programa te prepara para destacar en el sector. ${base.description || ''}`,
  image: base.image || 'placeholder-image-programs.webp',
  format: base.format || 'Online',
  language: base.language || 'Español',
  startDate: base.startDate || 'Próximamente',
  certification: base.certification || (base.type === 'Master' ? 'Título Propio Universidad' : 'Certificado de Experto'),
  price: base.price || 1499,
  originalPrice: base.originalPrice,
  modules: base.modules || [
    {
      title: 'Módulo 1',
      description: 'Contenido del módulo',
      hours: 100,
      units: [{ title: 'Tema 1' }, { title: 'Tema 2' }, { title: 'Tema 3' }]
    }
  ],
  topics: base.topics || [],
  audience: base.audience || '',
  careers: base.careers || '',
  objectives: base.objectives || ''
} as Program);

// Complete remaining programs with default data
const completePrograms = (programs: Partial<Program>[]): Program[] => {
  return programs.map(p => {
    // Always ensure slug exists
    const slug = p.slug || generateSlug(p.title!);

    if (p.description && p.modules && p.modules.length > 0) {
      return { ...p, slug } as Program;
    }
    return getDefaultProgramData({ ...p, slug });
  });
};

export const COMPLETE_PROGRAMS = completePrograms(ALL_PROGRAMS);
