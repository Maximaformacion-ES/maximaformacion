export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  id: number;
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

export const ALL_BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: 'Introducción al Análisis Estadístico con R: Guía Completa para Principiantes',
    slug: 'introduccion-analisis-estadistico-r',
    excerpt: 'Descubre cómo R Software se ha convertido en la herramienta líder para análisis estadístico. Aprende los fundamentos y comienza tu camino en la ciencia de datos.',
    content: `
      <h1>¿Qué es R Software?</h1>
      <p>R es un lenguaje de programación y entorno de software libre diseñado específicamente para análisis estadístico y visualización de datos. Desde su creación en 1993, R se ha convertido en el estándar de la industria para investigadores, científicos de datos y analistas estadísticos.</p>
      
      <h2>Ventajas de R Software</h2>
      <p>R Software ofrece numerosas ventajas que lo convierten en la herramienta preferida por profesionales de la estadística y ciencia de datos:</p>
      <ul>
        <li><strong>Software libre:</strong> Sin costes de licencia, ideal para empresas de todos los tamaños</li>
        <li><strong>Comunidad activa:</strong> Miles de paquetes disponibles para cualquier necesidad</li>
        <li><strong>Potencia estadística:</strong> Implementa las técnicas más avanzadas del mercado</li>
        <li><strong>Visualización:</strong> Crea gráficos de alta calidad profesional</li>
      </ul>
      
      <h2>Casos de Uso Reales</h2>
      <p>En Máxima Consultoría utilizamos R para proyectos que van desde análisis predictivo en empresas tecnológicas hasta estudios bioestadísticos en el sector farmacéutico. La versatilidad de R lo convierte en la herramienta perfecta para cualquier desafío estadístico.</p>
      
      <h2>Conclusión</h2>
      <p>Si estás buscando una herramienta robusta, confiable y potente para análisis estadístico, R Software es la elección correcta. Con inversión a coste cero y capacidades ilimitadas, no hay mejor momento para comenzar.</p>
    `,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    category: 'R Software',
    author: {
      name: 'Dr. María González',
      role: 'Directora de Análisis Estadístico',
      avatar: 'https://i.pravatar.cc/150?u=maria'
    },
    publishedAt: '2024-01-15',
    readTime: '8 min',
    tags: ['R Software', 'Estadística', 'Tutorial', 'Data Science'],
    featured: true
  },
  {
    id: 2,
    title: 'Big Data y Data Mining: Técnicas Avanzadas para Empresas',
    slug: 'big-data-data-mining-tecnicas-avanzadas',
    excerpt: 'Explora cómo las técnicas de Big Data y Data Mining pueden transformar la toma de decisiones en tu empresa. Casos prácticos y metodologías probadas.',
    content: `
      <h1>El Poder del Big Data</h1>
      <p>En la era digital actual, las empresas generan volúmenes masivos de datos cada día. El Big Data no es solo una tendencia, es una realidad que está transformando cómo las organizaciones operan y compiten.</p>
      
      <h2>Técnicas de Data Mining</h2>
      <p>El Data Mining permite extraer patrones y conocimiento valioso de grandes conjuntos de datos. Las técnicas más efectivas incluyen:</p>
      <ul>
        <li><strong>Clustering:</strong> Identificación de grupos naturales en los datos</li>
        <li><strong>Clasificación:</strong> Predicción de categorías basada en patrones históricos</li>
        <li><strong>Asociación:</strong> Descubrimiento de relaciones entre variables</li>
        <li><strong>Regresión:</strong> Predicción de valores numéricos continuos</li>
      </ul>
      
      <h2>Aplicaciones Empresariales</h2>
      <p>Desde optimización de inventarios hasta análisis de comportamiento del cliente, las técnicas de Big Data están revolucionando sectores como retail, finanzas, salud y tecnología.</p>
    `,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    category: 'Data Science',
    author: {
      name: 'Carlos Martínez',
      role: 'Consultor Senior en Big Data',
      avatar: 'https://i.pravatar.cc/150?u=carlos'
    },
    publishedAt: '2024-01-10',
    readTime: '12 min',
    tags: ['Big Data', 'Data Mining', 'Empresas', 'Análisis'],
    featured: true
  },
  {
    id: 3,
    title: 'Análisis Predictivo: Cómo Predecir el Futuro de tu Negocio',
    slug: 'analisis-predictivo-predecir-futuro-negocio',
    excerpt: 'Los modelos predictivos están cambiando la forma en que las empresas planifican su futuro. Aprende cómo implementar análisis predictivo efectivo.',
    content: `
      <h2>¿Qué es el Análisis Predictivo?</h2>
      <p>El análisis predictivo utiliza datos históricos, técnicas estadísticas y algoritmos de machine learning para identificar la probabilidad de resultados futuros. Es una herramienta poderosa para la toma de decisiones estratégicas.</p>
      
      <h2>Modelos Comunes</h2>
      <ul>
        <li><strong>Regresión Lineal:</strong> Para predicciones numéricas continuas</li>
        <li><strong>Árboles de Decisión:</strong> Para clasificación y regresión</li>
        <li><strong>Redes Neuronales:</strong> Para patrones complejos no lineales</li>
        <li><strong>Series Temporales:</strong> Para predicciones basadas en tiempo</li>
      </ul>
      
      <h2>Beneficios Empresariales</h2>
      <p>Las empresas que implementan análisis predictivo pueden anticipar tendencias, optimizar recursos, reducir riesgos y mejorar la satisfacción del cliente.</p>
    `,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    category: 'Data Science',
    author: {
      name: 'Ana Rodríguez',
      role: 'Especialista en Machine Learning',
      avatar: 'https://i.pravatar.cc/150?u=ana'
    },
    publishedAt: '2024-01-05',
    readTime: '10 min',
    tags: ['Predictivo', 'Machine Learning', 'Negocio', 'Modelos'],
    featured: false
  },
  {
    id: 4,
    title: 'Estadística Descriptiva vs Inferencial: Guía Práctica',
    slug: 'estadistica-descriptiva-vs-inferencial',
    excerpt: 'Comprende las diferencias fundamentales entre estadística descriptiva e inferencial y cuándo usar cada una en tus análisis.',
    content: `
      <h2>Estadística Descriptiva</h2>
      <p>La estadística descriptiva se enfoca en resumir y describir las características principales de un conjunto de datos. Incluye medidas como:</p>
      <ul>
        <li>Medidas de tendencia central (media, mediana, moda)</li>
        <li>Medidas de dispersión (desviación estándar, rango)</li>
        <li>Visualizaciones (histogramas, gráficos de dispersión)</li>
      </ul>
      
      <h2>Estadística Inferencial</h2>
      <p>La estadística inferencial permite hacer conclusiones sobre una población basándose en una muestra. Técnicas comunes incluyen:</p>
      <ul>
        <li>Pruebas de hipótesis</li>
        <li>Intervalos de confianza</li>
        <li>Análisis de regresión</li>
        <li>Análisis de varianza (ANOVA)</li>
      </ul>
      
      <h2>Cuándo Usar Cada Una</h2>
      <p>Usa estadística descriptiva para explorar y entender tus datos. Usa estadística inferencial cuando necesites hacer generalizaciones o tomar decisiones basadas en muestras.</p>
    `,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    category: 'Estadística',
    author: {
      name: 'Dr. María González',
      role: 'Directora de Análisis Estadístico',
      avatar: 'https://i.pravatar.cc/150?u=maria'
    },
    publishedAt: '2023-12-28',
    readTime: '7 min',
    tags: ['Estadística', 'Fundamentos', 'Guía', 'Teoría'],
    featured: false
  },
  {
    id: 5,
    title: 'Casos de Éxito: Cómo Optimizamos el Inventario de una Empresa Retail',
    slug: 'caso-exito-optimizacion-inventario-retail',
    excerpt: 'Descubre cómo aplicamos técnicas estadísticas avanzadas para reducir costos de inventario en un 30% en una cadena de retail nacional.',
    content: `
      <h2>El Desafío</h2>
      <p>Una cadena de retail con más de 200 tiendas enfrentaba problemas de sobrestock y rotura de inventario, resultando en pérdidas significativas.</p>
      
      <h2>Nuestra Solución</h2>
      <p>Implementamos un sistema de análisis predictivo que combinaba:</p>
      <ul>
        <li>Análisis de series temporales para predecir demanda</li>
        <li>Modelos de optimización para niveles de inventario</li>
        <li>Análisis de patrones estacionales</li>
        <li>Automatización de pedidos</li>
      </ul>
      
      <h2>Resultados</h2>
      <ul>
        <li>Reducción del 30% en costos de inventario</li>
        <li>Disminución del 45% en roturas de stock</li>
        <li>Mejora del 25% en satisfacción del cliente</li>
        <li>ROI del 400% en el primer año</li>
      </ul>
      
      <h2>Lecciones Aprendidas</h2>
      <p>Este caso demuestra cómo el análisis estadístico correctamente aplicado puede generar valor real y medible para las empresas.</p>
    `,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
    category: 'Casos de Éxito',
    author: {
      name: 'Carlos Martínez',
      role: 'Consultor Senior en Big Data',
      avatar: 'https://i.pravatar.cc/150?u=carlos'
    },
    publishedAt: '2023-12-20',
    readTime: '15 min',
    tags: ['Casos de Éxito', 'Retail', 'Optimización', 'ROI'],
    featured: true
  },
  {
    id: 6,
    title: 'Formación en Estadística Aplicada: Por Qué es Esencial para tu Carrera',
    slug: 'formacion-estadistica-aplicada-esencial',
    excerpt: 'La formación continua en estadística aplicada es clave para destacar en el mercado laboral actual. Descubre cómo nuestros programas pueden impulsar tu carrera.',
    content: `
      <h2>La Demanda de Profesionales Estadísticos</h2>
      <p>El mercado laboral está experimentando una demanda sin precedentes de profesionales capaces de trabajar con datos. Las empresas buscan analistas que puedan transformar datos en decisiones estratégicas.</p>
      
      <h2>Nuestros Programas de Formación</h2>
      <p>En Máxima Formación ofrecemos programas especializados que combinan:</p>
      <ul>
        <li>Fundamentos teóricos sólidos</li>
        <li>Aplicación práctica con casos reales</li>
        <li>Herramientas profesionales (R, Python, SQL)</li>
        <li>Seguimiento tutorizado personalizado</li>
      </ul>
      
      <h2>Ventajas de Nuestra Metodología</h2>
      <ul>
        <li><strong>100% Online:</strong> Flexibilidad total para estudiar desde cualquier lugar</li>
        <li><strong>Contenidos Propios:</strong> Desarrollados por expertos con años de experiencia</li>
        <li><strong>Aplicación Práctica:</strong> Proyectos reales que puedes añadir a tu portfolio</li>
        <li><strong>Feedback Personalizado:</strong> Acompañamiento constante durante todo el proceso</li>
      </ul>
      
      <h2>Invierte en tu Futuro</h2>
      <p>La formación en estadística aplicada es una inversión que se paga sola. Los profesionales con estas habilidades tienen salarios significativamente más altos y mejores oportunidades de crecimiento.</p>
    `,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    category: 'Formación',
    author: {
      name: 'Ana Rodríguez',
      role: 'Especialista en Machine Learning',
      avatar: 'https://i.pravatar.cc/150?u=ana'
    },
    publishedAt: '2023-12-15',
    readTime: '9 min',
    tags: ['Formación', 'Carrera', 'Estadística', 'Educación'],
    featured: false
  },
  {
    id: 7,
    title: 'Visualización de Datos: El Arte de Contar Historias con Gráficos',
    slug: 'visualizacion-datos-arte-contar-historias',
    excerpt: 'Aprende a crear visualizaciones de datos que no solo informen, sino que inspiren acción. Técnicas profesionales para gráficos de alta calidad.',
    content: `
      <h2>La Importancia de la Visualización</h2>
      <p>Un buen gráfico puede comunicar en segundos lo que un informe de 50 páginas tarda en explicar. La visualización efectiva de datos es esencial para la toma de decisiones empresariales.</p>
      
      <h2>Principios de Diseño</h2>
      <ul>
        <li><strong>Claridad:</strong> El mensaje debe ser inmediatamente comprensible</li>
        <li><strong>Precisión:</strong> Los datos deben representarse con exactitud</li>
        <li><strong>Estética:</strong> El diseño debe ser atractivo y profesional</li>
        <li><strong>Contexto:</strong> Proporcionar información suficiente para la interpretación</li>
      </ul>
      
      <h2>Herramientas Recomendadas</h2>
      <p>En Máxima Consultoría utilizamos principalmente R (ggplot2) y Python (matplotlib, seaborn) para crear visualizaciones de nivel profesional que nuestros clientes pueden usar directamente en presentaciones ejecutivas.</p>
      
      <h2>Casos de Éxito</h2>
      <p>Nuestros gráficos han ayudado a empresas a comunicar insights complejos a stakeholders, facilitando decisiones estratégicas multimillonarias.</p>
    `,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    category: 'Data Science',
    author: {
      name: 'Dr. María González',
      role: 'Directora de Análisis Estadístico',
      avatar: 'https://i.pravatar.cc/150?u=maria'
    },
    publishedAt: '2023-12-10',
    readTime: '11 min',
    tags: ['Visualización', 'Gráficos', 'Comunicación', 'Diseño'],
    featured: false
  },
  {
    id: 8,
    title: 'Automatización de Análisis: Ahorra Tiempo y Aumenta la Precisión',
    slug: 'automatizacion-analisis-ahorra-tiempo-precision',
    excerpt: 'Descubre cómo la automatización de análisis estadísticos puede transformar tu flujo de trabajo, reduciendo errores y liberando tiempo para análisis estratégicos.',
    content: `
      <h2>El Problema del Análisis Manual</h2>
      <p>Los análisis manuales repetitivos consumen tiempo valioso y son propensos a errores humanos. La automatización es la solución moderna a este desafío.</p>
      
      <h2>Beneficios de la Automatización</h2>
      <ul>
        <li><strong>Ahorro de Tiempo:</strong> Reduce el tiempo de análisis en un 70-90%</li>
        <li><strong>Precisión:</strong> Elimina errores humanos en cálculos repetitivos</li>
        <li><strong>Escalabilidad:</strong> Procesa grandes volúmenes de datos sin esfuerzo adicional</li>
        <li><strong>Reproducibilidad:</strong> Garantiza resultados consistentes</li>
      </ul>
      
      <h2>Nuestras Soluciones</h2>
      <p>Desarrollamos sistemas automatizados que incluyen:</p>
      <ul>
        <li>Scripts R/Python para análisis recurrentes</li>
        <li>Dashboards interactivos con actualización automática</li>
        <li>Reportes automatizados programados</li>
        <li>Integración con sistemas empresariales existentes</li>
      </ul>
      
      <h2>ROI de la Automatización</h2>
      <p>Las empresas que automatizan sus análisis reportan un ROI promedio del 300% en el primer año, además de mejorar significativamente la calidad de sus decisiones.</p>
    `,
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    category: 'Data Science',
    author: {
      name: 'Carlos Martínez',
      role: 'Consultor Senior en Big Data',
      avatar: 'https://i.pravatar.cc/150?u=carlos'
    },
    publishedAt: '2023-12-05',
    readTime: '13 min',
    tags: ['Automatización', 'Eficiencia', 'ROI', 'Tecnología'],
    featured: false
  }
];

export const getBlogPostById = (id: number): BlogPost | undefined => {
  return ALL_BLOG_POSTS.find(post => post.id === id);
};

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return ALL_BLOG_POSTS.find(post => post.slug === slug);
};

export const getRelatedPosts = (currentPostId: number, limit: number = 3): BlogPost[] => {
  const currentPost = ALL_BLOG_POSTS.find(p => p.id === currentPostId);
  if (!currentPost) return [];
  
  return ALL_BLOG_POSTS
    .filter(post => 
      post.id !== currentPostId && 
      (post.category === currentPost.category || 
       post.tags.some(tag => currentPost.tags.includes(tag)))
    )
    .slice(0, limit);
};
