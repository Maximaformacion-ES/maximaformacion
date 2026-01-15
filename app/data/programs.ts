export interface ProgramModule {
  title: string;
  description: string;
  hours: number;
  topics: string[];
}

export interface Program {
  id: number;
  type: 'Master' | 'Curso';
  title: string;
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
}

export const ALL_PROGRAMS: Partial<Program>[] = [
  { 
    id: 1, 
    type: 'Master', 
    title: 'Máster en Inteligencia Artificial Aplicada', 
    duration: '1500h', 
    ects: '60 ECTS', 
    tags: ['Tecnología', 'Innovación'], 
    featured: true,
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
        topics: ['Historia de la IA', 'Tipos de aprendizaje', 'Ética en IA', 'Casos de uso empresariales']
      },
      {
        title: 'Machine Learning Avanzado',
        description: 'Algoritmos supervisados y no supervisados, ensemble methods',
        hours: 200,
        topics: ['Regresión y clasificación', 'Random Forest', 'Gradient Boosting', 'Clustering']
      },
      {
        title: 'Deep Learning y Redes Neuronales',
        description: 'Arquitecturas profundas y frameworks modernos',
        hours: 250,
        topics: ['TensorFlow y PyTorch', 'CNNs', 'RNNs y LSTM', 'Transformers']
      },
      {
        title: 'Proyecto Final',
        description: 'Desarrollo de un proyecto completo de IA aplicada',
        hours: 300,
        topics: ['Diseño de solución', 'Implementación', 'Despliegue', 'Presentación']
      }
    ],
    audience: [
      'Ingenieros de software con experiencia en programación',
      'Profesionales de datos que quieren especializarse en IA',
      'Directivos tecnológicos que necesitan entender IA',
      'Emprendedores en el sector tech'
    ],
    careers: [
      'AI Engineer',
      'Machine Learning Engineer',
      'Data Scientist especializado en IA',
      'AI Product Manager',
      'Investigador en IA'
    ],
    objectives: [
      'Dominar los algoritmos de machine learning más utilizados en la industria',
      'Implementar soluciones de deep learning con frameworks modernos',
      'Desplegar modelos de IA en producción',
      'Entender las implicaciones éticas y legales de la IA'
    ]
  },
  { 
    id: 2, 
    type: 'Master', 
    title: 'Máster en Dirección de Ciberseguridad', 
    duration: '1500h', 
    ects: '60 ECTS', 
    tags: ['Seguridad', 'Gestión'], 
    featured: true,
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
        topics: ['Tipos de amenazas', 'Vulnerabilidades comunes', 'Marco legal', 'Estándares ISO']
      },
      {
        title: 'Gestión de Seguridad',
        description: 'Diseño e implementación de políticas de seguridad',
        hours: 200,
        topics: ['Risk Management', 'Compliance', 'Incident Response', 'Business Continuity']
      }
    ],
    audience: [
      'IT Managers y CTOs',
      'Profesionales de seguridad con experiencia técnica',
      'Auditores de seguridad',
      'Consultores en ciberseguridad'
    ],
    careers: [
      'CISO (Chief Information Security Officer)',
      'Security Manager',
      'Cybersecurity Consultant',
      'Risk Manager',
      'Compliance Officer'
    ],
    objectives: [
      'Diseñar estrategias de ciberseguridad corporativas',
      'Gestionar equipos de seguridad',
      'Implementar frameworks de compliance',
      'Responder a incidentes de seguridad'
    ]
  },
  { 
    id: 3, 
    type: 'Curso', 
    title: 'Experto en Big Data & Analytics', 
    duration: '750h', 
    ects: '30 ECTS', 
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
        topics: ['Hadoop Ecosystem', 'HDFS', 'MapReduce', 'YARN']
      },
      {
        title: 'Procesamiento con Spark',
        description: 'Análisis de datos con Apache Spark',
        hours: 150,
        topics: ['Spark Core', 'Spark SQL', 'Streaming', 'MLlib']
      }
    ],
    audience: [
      'Analistas de datos',
      'Desarrolladores que quieren especializarse en big data',
      'Profesionales de business intelligence'
    ],
    careers: [
      'Big Data Engineer',
      'Data Analyst',
      'Business Intelligence Analyst',
      'Data Architect'
    ],
    objectives: [
      'Dominar tecnologías de big data',
      'Procesar grandes volúmenes de datos',
      'Crear pipelines de datos',
      'Visualizar insights de negocio'
    ]
  },
  { 
    id: 4, 
    type: 'Master', 
    title: 'MBA en Transformación Digital', 
    duration: '1500h', 
    ects: '60 ECTS', 
    tags: ['Negocios', 'Digital'], 
    featured: false 
  },
  { 
    id: 5, 
    type: 'Curso', 
    title: 'Especialización en Cloud Computing', 
    duration: '500h', 
    ects: '20 ECTS', 
    tags: ['Tecnología', 'Cloud'], 
    featured: false 
  },
  { 
    id: 6, 
    type: 'Master', 
    title: 'Máster en Marketing Digital Avanzado', 
    duration: '1500h', 
    ects: '60 ECTS', 
    tags: ['Marketing', 'Digital'], 
    featured: true 
  },
  { 
    id: 7, 
    type: 'Curso', 
    title: 'Python para Data Science', 
    duration: '200h', 
    ects: '8 ECTS', 
    tags: ['Programación', 'Data'], 
    featured: false 
  },
  { 
    id: 8, 
    type: 'Master', 
    title: 'Máster en Gestión de Proyectos Ágiles', 
    duration: '1500h', 
    ects: '60 ECTS', 
    tags: ['Gestión', 'Agile'], 
    featured: false 
  },
  { 
    id: 9, 
    type: 'Curso', 
    title: 'UX/UI Design Fundamentals', 
    duration: '400h', 
    ects: '16 ECTS', 
    tags: ['Diseño', 'Producto'], 
    featured: false 
  },
];

export const CATEGORIES = ['Todos', 'Master', 'Curso'] as const;

// Helper function to get program by ID
export const getProgramById = (id: number): Program | undefined => {
  return COMPLETE_PROGRAMS.find(p => p.id === id);
};

// Helper function to get default program data (for programs without full details)
const getDefaultProgramData = (base: Partial<Program>): Program => ({
  ...base,
  id: base.id!,
  type: base.type!,
  title: base.title!,
  duration: base.duration!,
  ects: base.ects!,
  tags: base.tags!,
  featured: base.featured ?? false,
  description: base.description || `${base.title} - Formación especializada de alta calidad.`,
  longDescription: base.longDescription || `Este programa te prepara para destacar en el sector. ${base.description || ''}`,
  image: base.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
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
      topics: ['Tema 1', 'Tema 2', 'Tema 3']
    }
  ],
  audience: base.audience || ['Profesionales del sector', 'Recién graduados', 'Personas en transición profesional'],
  careers: base.careers || ['Especialista', 'Consultor', 'Manager'],
  objectives: base.objectives || ['Adquirir conocimientos especializados', 'Desarrollar habilidades prácticas', 'Aplicar en proyectos reales']
} as Program);

// Complete remaining programs with default data
const completePrograms = (programs: Partial<Program>[]): Program[] => {
  return programs.map(p => {
    if (p.description && p.modules && p.modules.length > 0) {
      return p as Program;
    }
    return getDefaultProgramData(p);
  });
};

export const COMPLETE_PROGRAMS = completePrograms(ALL_PROGRAMS);
