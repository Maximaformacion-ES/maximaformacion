export interface Program {
  id: number;
  type: 'Master' | 'Curso';
  title: string;
  duration: string;
  ects: string;
  tags: string[];
  featured: boolean;
}

export const ALL_PROGRAMS: Program[] = [
  { 
    id: 1, 
    type: 'Master', 
    title: 'Máster en Inteligencia Artificial Aplicada', 
    duration: '1500h', 
    ects: '60 ECTS', 
    tags: ['Tecnología', 'Innovación'], 
    featured: true 
  },
  { 
    id: 2, 
    type: 'Master', 
    title: 'Máster en Dirección de Ciberseguridad', 
    duration: '1500h', 
    ects: '60 ECTS', 
    tags: ['Seguridad', 'Gestión'], 
    featured: true 
  },
  { 
    id: 3, 
    type: 'Curso', 
    title: 'Experto en Big Data & Analytics', 
    duration: '750h', 
    ects: '30 ECTS', 
    tags: ['Data', 'Analítica'], 
    featured: false 
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
