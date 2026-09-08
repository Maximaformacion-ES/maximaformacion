// Preguntas frecuentes del pack, transcritas del documento del cliente
// ("FAQ Pack tres cursos.docx" — 21 preguntas en 5 categorías). Se muestran
// agrupadas por pestañas para no convertir la página en un scroll infinito.

import { BookOpen, CreditCard, GraduationCap, Laptop, Wrench, type LucideIcon } from 'lucide-react';

export const PACK_FAQ_GROUPS: {
  label: string;
  icon?: LucideIcon;
  faqs: { question: string; answer: string }[];
}[] = [
  {
    label: 'Matrícula y precio',
    icon: CreditCard,
    faqs: [
      {
        question: '¿Cuál es el precio del pack de tres cursos y qué incluye?',
        answer:
          'El pack completo con los tres cursos tiene un precio de 190 €. Este precio incluye la matrícula en los tres cursos universitarios. El coste de expedición del certificado no está incluido en el precio de la matrícula.',
      },
      {
        question: '¿Puedo matricularme en los cursos por separado o es obligatorio comprar el pack?',
        answer:
          'Sí, puedes matricularte en los cursos de forma individual. Cada curso tiene un precio de matrícula de 95 €. Sin embargo, el pack de tres cursos por 190 € ofrece un ahorro significativo.',
      },
      {
        question: '¿Cuál es la fecha de inicio de los cursos?',
        answer: 'La fecha prevista de inicio para los tres cursos es el 5 de octubre de 2026.',
      },
      {
        question: '¿Cuál es la carga lectiva de cada curso?',
        answer:
          'Cada uno de los tres cursos tiene una carga lectiva de 4 créditos ECTS. Un crédito ECTS equivale a 25 horas de trabajo del estudiante, lo que suma un total de 100 horas por curso.',
      },
      {
        question: '¿Cómo se gestiona la matrícula y la parte administrativa?',
        answer:
          'La gestión administrativa (matrícula, actas de exámenes y certificados) es externa. Esto significa que la realiza el centro solicitante (BIOMÁXIMA INFORMACIÓN Y EXPERIMENTACIÓN CIENTÍFICA, S.L.U.) y no la UCAV directamente.',
      },
    ],
  },
  {
    label: 'Contenido de los cursos',
    icon: BookOpen,
    faqs: [
      {
        question: '¿Qué voy a aprender en el curso "Atención Educativa al Alumnado con Discapacidad Motora y SAAC"?',
        answer:
          'Este curso está diseñado para que aprendas a atender educativamente a estudiantes con discapacidad motora. Abarca desde la conceptualización de la discapacidad motora y la educación inclusiva, hasta la evaluación psicopedagógica, el diseño de respuestas educativas y, de manera muy especial, el uso de Sistemas Aumentativos y Alternativos de Comunicación (SAAC), incluyendo sistemas pictográficos y comunicadores.',
      },
      {
        question:
          '¿Qué voy a aprender en el curso "Inteligencia Artificial y eXeLearning: Crea Recursos Educativos Interactivos en Tiempo Récord"?',
        answer:
          'Este curso te enseñará a crear recursos educativos digitales e interactivos de forma rápida y eficiente. Aprenderás a usar la Inteligencia Artificial (IA) Generativa para agilizar todo el proceso: desde la creación de contenidos y recursos multimedia (imágenes, audio, vídeo) hasta el diseño de actividades y la automatización de tareas docentes. Todo el material lo integrarás y publicarás utilizando la herramienta eXeLearning.',
      },
      {
        question:
          '¿Qué voy a aprender en el curso "H5P e Inteligencia Artificial: Diseña Actividades Interactivas para Moodle en Minutos"?',
        answer:
          'Este curso se centra en la creación de actividades interactivas y evaluables para la plataforma Moodle. Aprenderás a usar la herramienta H5P para diseñar desde cuestionarios y vídeos interactivos hasta juegos y escenarios ramificados. Además, te mostrará cómo la Inteligencia Artificial puede ayudarte a generar preguntas, guiones y retroalimentaciones, automatizando gran parte del trabajo de creación.',
      },
      {
        question: '¿Cuál es la estructura de cada curso?',
        answer:
          'Los tres cursos tienen una estructura similar y están organizados en 10 módulos de 0,4 ECTS cada uno. Cada módulo aborda un aspecto clave de la temática del curso.',
      },
      {
        question: '¿Los cursos son en español o en inglés?',
        answer: 'Las enseñanzas se impartirán en español e inglés.',
      },
    ],
  },
  {
    label: 'Metodología y evaluación',
    icon: Laptop,
    faqs: [
      {
        question: '¿Cómo son las clases? ¿Son presenciales?',
        answer: 'No, la modalidad de los tres cursos es a distancia.',
      },
      {
        question: '¿Qué metodologías de enseñanza se utilizan?',
        answer:
          'La metodología es variada y combina clases teóricas, clases prácticas, tutorías y otras metodologías no presenciales. Esto significa que el aprendizaje se basa en el estudio autónomo, la realización de actividades prácticas y el seguimiento personalizado a través de tutorías.',
      },
      {
        question: '¿Cómo se evalúa el aprendizaje?',
        answer:
          'El sistema de evaluación es una evaluación continua. Esto implica que tu calificación final se obtendrá a partir de la suma de las calificaciones obtenidas en las diferentes actividades que realices a lo largo del curso.',
      },
      {
        question: '¿Qué sistema de calificación se utiliza?',
        answer:
          'Las calificaciones se otorgan siguiendo el sistema del Real Decreto 1125/2003, es decir, con una nota numérica del 0 al 10.',
      },
    ],
  },
  {
    label: 'Titulación',
    icon: GraduationCap,
    faqs: [
      {
        question: '¿Qué título o certificado obtendré al finalizar?',
        answer:
          'Al superar cada curso, recibirás un "Certificado Universitario" de la Universidad Católica de Ávila (UCAV) con la denominación exacta del curso superado.',
      },
      {
        question: '¿Los títulos propios de la UCAV son oficiales?',
        answer:
          'No. Es importante que sepas que los títulos propios, como los que ofrece este pack, no tienen carácter oficial. Esto significa que, aunque son expedidos por una universidad y gozan de prestigio, no habilitan para el ejercicio de profesiones reguladas que requieren un título oficial.',
      },
      {
        question: '¿El certificado tiene validez en todo el territorio nacional?',
        answer:
          'Los títulos propios carecen de los efectos que las disposiciones legales otorgan a los títulos universitarios de carácter oficial y validez en todo el territorio nacional. Su valor es principalmente curricular y profesional, demostrando tu especialización en la materia.',
      },
      {
        question: '¿El coste de expedición del certificado está incluido en la matrícula?',
        answer: 'No. El coste de expedición del certificado no está incluido en el precio de la matrícula.',
      },
    ],
  },
  {
    label: 'Aspectos prácticos',
    icon: Wrench,
    faqs: [
      {
        question: '¿Necesito conocimientos previos para realizar estos cursos?',
        answer:
          'Aunque los cursos están diseñados para ser accesibles, se recomienda tener un interés en el ámbito educativo y un manejo básico de herramientas informáticas. El curso de "Atención Educativa…" es ideal para docentes, pedagogos o psicopedagogos. Los cursos de IA y herramientas digitales, por su parte, están pensados para cualquier docente o profesional que quiera integrar la tecnología en su práctica diaria.',
      },
      {
        question: '¿Quién es el profesorado?',
        answer:
          'Los tres cursos son impartidos por el mismo profesor, D. José Antonio Lorente Ruiz. Es un profesional con amplia experiencia en formación e-learning, administración de plataformas Moodle y diseño de contenidos digitales con herramientas como eXeLearning, H5P e Inteligencia Artificial aplicada a la educación.',
      },
      {
        question: '¿Qué pasa si solo quiero hacer uno de los cursos?',
        answer:
          'Puedes hacerlo. Cada curso se puede adquirir por separado por 95 €. El pack es una opción para quienes quieran una formación más completa y ahorrar.',
      },
    ],
  },
];
