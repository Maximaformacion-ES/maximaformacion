import type { MaxymiaCourse } from '../types';

export const MAXYMIA_COURSES: MaxymiaCourse[] = [
  // ── Course 1: Fundamentos de IA (Bilingual) ──────────────────────────
  {
    id: 'course-ia-fundamentals',
    slug: 'fundamentos-ia',
    title: {
      es: 'Fundamentos de Inteligencia Artificial',
      en: 'Fundamentals of Artificial Intelligence',
    },
    description: {
      es: 'Domina los conceptos esenciales de la IA: desde redes neuronales hasta modelos de lenguaje. Un curso práctico con ejemplos en Python.',
      en: 'Master the essential concepts of AI: from neural networks to language models. A hands-on course with Python examples.',
    },
    thumbnailTitle: {
      es: 'IA\nFUNDAMENTAL',
      en: 'AI\nFUNDAMENTALS',
    },
    image: '/images/maxymia/course-ia-fundamentals.jpg',
    blocks: [
      {
        id: 'block-1-intro',
        title: {
          es: 'Introducción a la IA',
          en: 'Introduction to AI',
        },
        content: {
          es: [
            {
              type: 'text',
              html: '<p>En este bloque exploraremos los conceptos fundamentales de la Inteligencia Artificial, desde su definición y alcance hasta los diferentes tipos de aprendizaje automático. Al finalizar, tendrás una comprensión sólida de qué es la IA y cómo se clasifican sus técnicas principales.</p>',
            },
          ],
          en: [
            {
              type: 'text',
              html: '<p>In this block we will explore the fundamental concepts of Artificial Intelligence, from its definition and scope to the different types of machine learning. By the end, you will have a solid understanding of what AI is and how its main techniques are classified.</p>',
            },
          ],
        },
        lessons: [
          {
            id: 'lesson-1-1',
            title: {
              es: '¿Qué es la Inteligencia Artificial?',
              en: 'What is Artificial Intelligence?',
            },
            description: { es: '', en: '' },
            topics: [],
            estimatedMinutes: 25,
            content: {
              es: [
                {
                  type: 'text',
                  html: '<h2>¿Qué es la Inteligencia Artificial?</h2><p>La inteligencia artificial (IA) es una rama de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana. Esto incluye el aprendizaje, el razonamiento, la percepción y la toma de decisiones.</p><p>El campo de la IA ha experimentado un crecimiento exponencial en la última década, impulsado por avances en el poder computacional, la disponibilidad de grandes conjuntos de datos y mejoras en los algoritmos de aprendizaje.</p>',
                },
                {
                  type: 'video',
                  vimeoId: '76979871',
                  title: 'Introducción visual a la IA',
                },
                {
                  type: 'callout',
                  variant: 'info',
                  title: 'Dato interesante',
                  content: 'El término "Inteligencia Artificial" fue acuñado por John McCarthy en 1956 durante la Conferencia de Dartmouth.',
                },
                {
                  type: 'text',
                  html: '<h2>Historia de la IA</h2><p>La historia de la IA se puede dividir en varias etapas clave:</p><ul><li><strong>1950s:</strong> Alan Turing propone el Test de Turing</li><li><strong>1956:</strong> Conferencia de Dartmouth — nace el campo</li><li><strong>1960-70s:</strong> Primeros sistemas expertos</li><li><strong>1980s:</strong> Boom y posterior "invierno de la IA"</li><li><strong>2010s:</strong> Deep Learning revoluciona el campo</li><li><strong>2020s:</strong> Modelos de lenguaje a gran escala (LLMs)</li></ul>',
                },
                {
                  type: 'image',
                  src: '/images/maxymia/ai-timeline.jpg',
                  alt: 'Línea temporal de la IA',
                  caption: 'Evolución de la inteligencia artificial desde los años 50 hasta la actualidad',
                },
              ],
              en: [
                {
                  type: 'text',
                  html: '<h2>What is Artificial Intelligence?</h2><p>Artificial intelligence (AI) is a branch of computer science that seeks to create systems capable of performing tasks that normally require human intelligence. This includes learning, reasoning, perception, and decision-making.</p><p>The field of AI has experienced exponential growth in the last decade, driven by advances in computing power, the availability of large datasets, and improvements in learning algorithms.</p>',
                },
                {
                  type: 'video',
                  vimeoId: '76979871',
                  title: 'Visual introduction to AI',
                },
                {
                  type: 'callout',
                  variant: 'info',
                  title: 'Fun fact',
                  content: 'The term "Artificial Intelligence" was coined by John McCarthy in 1956 during the Dartmouth Conference.',
                },
                {
                  type: 'text',
                  html: '<h2>History of AI</h2><p>The history of AI can be divided into several key stages:</p><ul><li><strong>1950s:</strong> Alan Turing proposes the Turing Test</li><li><strong>1956:</strong> Dartmouth Conference — the field is born</li><li><strong>1960-70s:</strong> First expert systems</li><li><strong>1980s:</strong> Boom and subsequent "AI winter"</li><li><strong>2010s:</strong> Deep Learning revolutionizes the field</li><li><strong>2020s:</strong> Large Language Models (LLMs)</li></ul>',
                },
                {
                  type: 'image',
                  src: '/images/maxymia/ai-timeline.jpg',
                  alt: 'AI Timeline',
                  caption: 'Evolution of artificial intelligence from the 1950s to the present',
                },
              ],
            },
          },
          {
            id: 'lesson-1-2',
            title: {
              es: 'Tipos de IA y Machine Learning',
              en: 'Types of AI and Machine Learning',
            },
            description: { es: '', en: '' },
            topics: [],
            estimatedMinutes: 30,
            content: {
              es: [
                {
                  type: 'text',
                  html: '<h2>IA Débil vs IA Fuerte</h2><p>La IA se clasifica generalmente en dos categorías principales:</p><p><strong>IA Débil (Narrow AI):</strong> Diseñada para realizar una tarea específica. Es la única forma de IA que existe actualmente. Ejemplos: Siri, recomendaciones de Netflix, GPT.</p><p><strong>IA Fuerte (General AI):</strong> Hipotética IA con capacidad de razonamiento general equivalente a la humana. Aún no existe pero es un objetivo activo de investigación.</p>',
                },
                {
                  type: 'text',
                  html: '<h2>Paradigmas de Machine Learning</h2><p>El machine learning se divide en tres paradigmas principales:</p>',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'ml_example.py',
                  code: '# Ejemplo de aprendizaje supervisado con scikit-learn\nfrom sklearn.linear_model import LinearRegression\nimport numpy as np\n\n# Datos de entrenamiento\nX = np.array([[1], [2], [3], [4], [5]])\ny = np.array([2, 4, 6, 8, 10])\n\n# Entrenar modelo\nmodel = LinearRegression()\nmodel.fit(X, y)\n\n# Predecir\nprint(model.predict([[6]]))  # Output: [12.]',
                },
                {
                  type: 'callout',
                  variant: 'tip',
                  title: 'Consejo práctico',
                  content: 'Siempre divide tus datos en conjuntos de entrenamiento y prueba (80/20 es una buena regla) para evaluar correctamente tu modelo.',
                },
              ],
              en: [
                {
                  type: 'text',
                  html: '<h2>Weak AI vs Strong AI</h2><p>AI is generally classified into two main categories:</p><p><strong>Weak AI (Narrow AI):</strong> Designed to perform a specific task. It is the only form of AI that currently exists. Examples: Siri, Netflix recommendations, GPT.</p><p><strong>Strong AI (General AI):</strong> Hypothetical AI with general reasoning capability equivalent to humans. It does not yet exist but is an active research goal.</p>',
                },
                {
                  type: 'text',
                  html: '<h2>Machine Learning Paradigms</h2><p>Machine learning is divided into three main paradigms:</p>',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'ml_example.py',
                  code: '# Supervised learning example with scikit-learn\nfrom sklearn.linear_model import LinearRegression\nimport numpy as np\n\n# Training data\nX = np.array([[1], [2], [3], [4], [5]])\ny = np.array([2, 4, 6, 8, 10])\n\n# Train model\nmodel = LinearRegression()\nmodel.fit(X, y)\n\n# Predict\nprint(model.predict([[6]]))  # Output: [12.]',
                },
                {
                  type: 'callout',
                  variant: 'tip',
                  title: 'Practical tip',
                  content: 'Always split your data into training and test sets (80/20 is a good rule) to properly evaluate your model.',
                },
              ],
            },
          },
        ],
        exam: {
          id: 'exam-block-1',
          title: {
            es: 'Examen: Introducción a la IA',
            en: 'Exam: Introduction to AI',
          },
          passingScore: 70,
          questions: [
            {
              type: 'single_choice',
              id: 'q-1-1-1',
              question: {
                es: '¿En qué año se acuñó el término "Inteligencia Artificial"?',
                en: 'In what year was the term "Artificial Intelligence" coined?',
              },
              options: [
                { es: '1943', en: '1943' },
                { es: '1950', en: '1950' },
                { es: '1956', en: '1956' },
                { es: '1969', en: '1969' },
              ],
              correctIndex: 2,
            },
            {
              type: 'multiple_choice',
              id: 'q-1-1-2',
              question: {
                es: '¿Cuáles de las siguientes son tareas típicas de la IA?',
                en: 'Which of the following are typical AI tasks?',
              },
              options: [
                { es: 'Reconocimiento de imágenes', en: 'Image recognition' },
                { es: 'Procesamiento del lenguaje natural', en: 'Natural language processing' },
                { es: 'Instalación de hardware', en: 'Hardware installation' },
                { es: 'Toma de decisiones autónoma', en: 'Autonomous decision making' },
              ],
              correctIndices: [0, 1, 3],
            },
            {
              type: 'ordering',
              id: 'q-1-1-3',
              question: {
                es: 'Ordena cronológicamente los siguientes hitos de la IA:',
                en: 'Order the following AI milestones chronologically:',
              },
              items: [
                { es: 'Test de Turing', en: 'Turing Test' },
                { es: 'Conferencia de Dartmouth', en: 'Dartmouth Conference' },
                { es: 'Sistemas expertos', en: 'Expert systems' },
                { es: 'Deep Learning', en: 'Deep Learning' },
              ],
              correctOrder: [0, 1, 2, 3],
            },
            {
              type: 'fill_blank',
              id: 'q-1-2-1',
              question: {
                es: 'La IA diseñada para una sola tarea se llama IA ___.',
                en: 'AI designed for a single task is called ___ AI.',
              },
              blanks: [
                { acceptedAnswers: ['débil', 'narrow', 'estrecha'] },
              ],
            },
            {
              type: 'single_choice',
              id: 'q-1-2-2',
              question: {
                es: '¿Qué tipo de aprendizaje utiliza datos etiquetados?',
                en: 'What type of learning uses labeled data?',
              },
              options: [
                { es: 'No supervisado', en: 'Unsupervised' },
                { es: 'Supervisado', en: 'Supervised' },
                { es: 'Por refuerzo', en: 'Reinforcement' },
                { es: 'Ninguno', en: 'None' },
              ],
              correctIndex: 1,
            },
            {
              type: 'free_text',
              id: 'q-1-2-3',
              question: {
                es: 'Explica brevemente la diferencia entre aprendizaje supervisado y no supervisado.',
                en: 'Briefly explain the difference between supervised and unsupervised learning.',
              },
              sampleAnswer: {
                es: 'El aprendizaje supervisado utiliza datos etiquetados donde el modelo aprende la relación entre entrada y salida. El no supervisado busca patrones en datos sin etiquetar.',
                en: 'Supervised learning uses labeled data where the model learns the relationship between input and output. Unsupervised learning finds patterns in unlabeled data.',
              },
            },
          ],
        },
      },
      {
        id: 'block-2-neural',
        title: {
          es: 'Redes Neuronales',
          en: 'Neural Networks',
        },
        content: {
          es: [
            {
              type: 'text',
              html: '<p>En este bloque profundizaremos en las redes neuronales artificiales, desde el perceptrón básico hasta las arquitecturas multicapa modernas y los algoritmos de entrenamiento que las hacen funcionar.</p>',
            },
          ],
          en: [
            {
              type: 'text',
              html: '<p>In this block we will dive deeper into artificial neural networks, from the basic perceptron to modern multilayer architectures and the training algorithms that make them work.</p>',
            },
          ],
        },
        lessons: [
          {
            id: 'lesson-2-1',
            title: {
              es: 'Perceptrones y redes feedforward',
              en: 'Perceptrons and feedforward networks',
            },
            description: { es: '', en: '' },
            topics: [],
            estimatedMinutes: 35,
            content: {
              es: [
                {
                  type: 'text',
                  html: '<h2>El Perceptrón</h2><p>El perceptrón es la unidad más básica de una red neuronal. Fue propuesto por Frank Rosenblatt en 1958 y puede entenderse como un clasificador lineal binario.</p><p>Un perceptrón recibe múltiples entradas, las multiplica por pesos, suma los resultados y aplica una función de activación para producir una salida.</p>',
                },
                {
                  type: 'video',
                  vimeoId: '76979871',
                  title: 'Visualización del perceptrón',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'perceptron.py',
                  code: 'import numpy as np\n\nclass Perceptron:\n    def __init__(self, n_inputs):\n        self.weights = np.random.randn(n_inputs)\n        self.bias = 0.0\n    \n    def predict(self, x):\n        return 1 if np.dot(self.weights, x) + self.bias > 0 else 0\n    \n    def train(self, X, y, lr=0.1, epochs=100):\n        for _ in range(epochs):\n            for xi, yi in zip(X, y):\n                pred = self.predict(xi)\n                self.weights += lr * (yi - pred) * xi\n                self.bias += lr * (yi - pred)',
                },
                {
                  type: 'text',
                  html: '<h2>Redes Multicapa (MLP)</h2><p>Las redes multicapa superan las limitaciones del perceptrón simple al añadir capas ocultas. Cada capa aplica transformaciones no lineales que permiten a la red aprender patrones complejos.</p><p>Componentes clave:</p><ul><li><strong>Capa de entrada:</strong> Recibe los datos</li><li><strong>Capas ocultas:</strong> Procesan la información</li><li><strong>Capa de salida:</strong> Produce la predicción</li></ul>',
                },
                {
                  type: 'callout',
                  variant: 'warning',
                  title: 'Cuidado con el overfitting',
                  content: 'Redes con demasiadas capas o neuronas pueden memorizar los datos de entrenamiento en lugar de generalizar. Utiliza técnicas de regularización como dropout.',
                },
              ],
              en: [
                {
                  type: 'text',
                  html: '<h2>The Perceptron</h2><p>The perceptron is the most basic unit of a neural network. It was proposed by Frank Rosenblatt in 1958 and can be understood as a binary linear classifier.</p><p>A perceptron receives multiple inputs, multiplies them by weights, sums the results, and applies an activation function to produce an output.</p>',
                },
                {
                  type: 'video',
                  vimeoId: '76979871',
                  title: 'Perceptron visualization',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'perceptron.py',
                  code: 'import numpy as np\n\nclass Perceptron:\n    def __init__(self, n_inputs):\n        self.weights = np.random.randn(n_inputs)\n        self.bias = 0.0\n    \n    def predict(self, x):\n        return 1 if np.dot(self.weights, x) + self.bias > 0 else 0\n    \n    def train(self, X, y, lr=0.1, epochs=100):\n        for _ in range(epochs):\n            for xi, yi in zip(X, y):\n                pred = self.predict(xi)\n                self.weights += lr * (yi - pred) * xi\n                self.bias += lr * (yi - pred)',
                },
                {
                  type: 'text',
                  html: '<h2>Multilayer Networks (MLP)</h2><p>Multilayer networks overcome the limitations of the simple perceptron by adding hidden layers. Each layer applies non-linear transformations that allow the network to learn complex patterns.</p><p>Key components:</p><ul><li><strong>Input layer:</strong> Receives the data</li><li><strong>Hidden layers:</strong> Process the information</li><li><strong>Output layer:</strong> Produces the prediction</li></ul>',
                },
                {
                  type: 'callout',
                  variant: 'warning',
                  title: 'Beware of overfitting',
                  content: 'Networks with too many layers or neurons can memorize training data instead of generalizing. Use regularization techniques like dropout.',
                },
              ],
            },
          },
          {
            id: 'lesson-2-2',
            title: {
              es: 'Backpropagation y entrenamiento',
              en: 'Backpropagation and training',
            },
            description: { es: '', en: '' },
            topics: [],
            estimatedMinutes: 40,
            content: {
              es: [
                {
                  type: 'text',
                  html: '<h2>Gradiente Descendente</h2><p>El gradiente descendente es el algoritmo de optimización más utilizado para entrenar redes neuronales. Su objetivo es minimizar la función de pérdida ajustando iterativamente los pesos de la red.</p><p>El proceso es análogo a descender una montaña en la niebla: en cada paso, miras la pendiente a tu alrededor y das un paso en la dirección de mayor descenso.</p>',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'gradient_descent.py',
                  code: '# Gradiente descendente simple\ndef gradient_descent(f, df, x0, lr=0.01, n_iter=1000):\n    x = x0\n    history = [x]\n    \n    for _ in range(n_iter):\n        grad = df(x)\n        x = x - lr * grad\n        history.append(x)\n    \n    return x, history\n\n# Ejemplo: minimizar f(x) = x^2\nimport numpy as np\nf = lambda x: x**2\ndf = lambda x: 2*x\n\nminimum, path = gradient_descent(f, df, x0=5.0)\nprint(f"Mínimo encontrado en x = {minimum:.6f}")',
                },
              ],
              en: [
                {
                  type: 'text',
                  html: '<h2>Gradient Descent</h2><p>Gradient descent is the most widely used optimization algorithm for training neural networks. Its goal is to minimize the loss function by iteratively adjusting the network weights.</p><p>The process is analogous to descending a mountain in fog: at each step, you look at the slope around you and take a step in the direction of steepest descent.</p>',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'gradient_descent.py',
                  code: '# Simple gradient descent\ndef gradient_descent(f, df, x0, lr=0.01, n_iter=1000):\n    x = x0\n    history = [x]\n    \n    for _ in range(n_iter):\n        grad = df(x)\n        x = x - lr * grad\n        history.append(x)\n    \n    return x, history\n\n# Example: minimize f(x) = x^2\nimport numpy as np\nf = lambda x: x**2\ndf = lambda x: 2*x\n\nminimum, path = gradient_descent(f, df, x0=5.0)\nprint(f"Minimum found at x = {minimum:.6f}")',
                },
              ],
            },
          },
        ],
      },
    ],
    price: 49,
    language: 'bilingual',
    instructor: {
      name: 'Dr. Ana García',
      role: 'Investigadora en IA — Universidad Complutense',
      avatar: '/images/maxymia/instructor-ana.jpg',
    },
    level: 'beginner',
    isPro: false,
    tags: ['IA', 'machine learning', 'redes neuronales', 'python'],
    category: 'ia',
    rating: 4.8,
    studentCount: 2340,
    originalPrice: 149,
    createdAt: '2025-09-15T00:00:00Z',
    objectives: `- Comprender los fundamentos teóricos de la inteligencia artificial y el aprendizaje automático
- Implementar redes neuronales básicas utilizando Python y frameworks modernos
- Conocer los principales modelos de lenguaje y sus aplicaciones prácticas
- Desarrollar proyectos prácticos de IA aplicada a problemas reales
- Evaluar y optimizar modelos de machine learning`,
    audiences: `- Desarrolladores de software que quieran ampliar sus habilidades al campo de la IA
- Profesionales de datos interesados en técnicas de machine learning
- Estudiantes de informática, matemáticas o ingenierías
- Profesionales que busquen una transición al campo de la inteligencia artificial`,
    careers: `- Ingeniero de Machine Learning
- Científico de Datos
- Desarrollador de IA
- Consultor de Inteligencia Artificial
- Investigador en IA aplicada`,
  },

  // ── Course 2: NLP con Transformers (Spanish) ─────────────────────────
  {
    id: 'course-nlp-transformers',
    slug: 'nlp-transformers',
    title: {
      es: 'Procesamiento del Lenguaje Natural con Transformers',
      en: 'Natural Language Processing with Transformers',
    },
    description: {
      es: 'Aprende a construir aplicaciones de NLP modernas usando la arquitectura Transformer, Hugging Face y modelos pre-entrenados.',
      en: 'Learn to build modern NLP applications using the Transformer architecture, Hugging Face, and pre-trained models.',
    },
    thumbnailTitle: {
      es: 'NLP\nTRANSFORMERS',
      en: 'NLP\nTRANSFORMERS',
    },
    image: '/images/maxymia/course-nlp.jpg',
    blocks: [
      {
        id: 'block-nlp-1',
        title: {
          es: 'Fundamentos de NLP',
          en: 'NLP Fundamentals',
        },
        content: {
          es: [
            {
              type: 'text',
              html: '<p>En este bloque aprenderás las bases del procesamiento del lenguaje natural, desde la tokenización y representación de texto hasta los modelos de secuencia que precedieron a los Transformers.</p>',
            },
          ],
          en: [
            {
              type: 'text',
              html: '<p>In this block you will learn the basics of natural language processing, from tokenization and text representation to the sequence models that preceded Transformers.</p>',
            },
          ],
        },
        lessons: [
          {
            id: 'lesson-nlp-1-1',
            title: {
              es: 'Tokenización y representación de texto',
              en: 'Tokenization and text representation',
            },
            description: { es: '', en: '' },
            topics: [],
            estimatedMinutes: 30,
            content: {
              es: [
                {
                  type: 'text',
                  html: '<h2>Word Embeddings</h2><p>Los word embeddings son representaciones vectoriales densas de palabras. A diferencia de one-hot encoding, estos vectores capturan relaciones semánticas entre palabras.</p><p><strong>Word2Vec</strong> (Google, 2013) demostró que operaciones vectoriales capturan analogías: <em>rey - hombre + mujer ≈ reina</em></p>',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'embeddings.py',
                  code: 'from gensim.models import Word2Vec\n\n# Entrenar embeddings sobre un corpus\nsentences = [\n    ["el", "gato", "está", "en", "la", "casa"],\n    ["el", "perro", "está", "en", "el", "jardín"],\n    ["la", "casa", "tiene", "un", "jardín"],\n]\n\nmodel = Word2Vec(sentences, vector_size=100, window=5, min_count=1)\n\n# Encontrar palabras similares\nprint(model.wv.most_similar("gato"))',
                },
              ],
              en: [
                {
                  type: 'text',
                  html: '<h2>Word Embeddings</h2><p>Word embeddings are dense vector representations of words. Unlike one-hot encoding, these vectors capture semantic relationships between words.</p><p><strong>Word2Vec</strong> (Google, 2013) showed that vector operations capture analogies: <em>king - man + woman ≈ queen</em></p>',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'embeddings.py',
                  code: 'from gensim.models import Word2Vec\n\n# Train embeddings on a corpus\nsentences = [\n    ["the", "cat", "is", "in", "the", "house"],\n    ["the", "dog", "is", "in", "the", "garden"],\n    ["the", "house", "has", "a", "garden"],\n]\n\nmodel = Word2Vec(sentences, vector_size=100, window=5, min_count=1)\n\n# Find similar words\nprint(model.wv.most_similar("cat"))',
                },
              ],
            },
          },
          {
            id: 'lesson-nlp-1-2',
            title: {
              es: 'Modelos de secuencia: RNN y LSTM',
              en: 'Sequence models: RNN and LSTM',
            },
            description: { es: '', en: '' },
            topics: [],
            estimatedMinutes: 35,
            content: {
              es: [
                {
                  type: 'text',
                  html: '<h2>Redes Neuronales Recurrentes</h2><p>Las RNN procesan secuencias manteniendo un estado oculto que se actualiza en cada paso temporal. Esto las hace ideales para texto, audio y series temporales.</p><p>Sin embargo, las RNN básicas sufren del <strong>problema del gradiente evanescente</strong>, lo que limita su capacidad para capturar dependencias a largo plazo.</p>',
                },
                {
                  type: 'callout',
                  variant: 'info',
                  content: 'Las LSTM (Long Short-Term Memory) resuelven el problema del gradiente evanescente usando un mecanismo de "puertas" que controla el flujo de información.',
                },
              ],
              en: [
                {
                  type: 'text',
                  html: '<h2>Recurrent Neural Networks</h2><p>RNNs process sequences by maintaining a hidden state that is updated at each time step. This makes them ideal for text, audio, and time series.</p><p>However, basic RNNs suffer from the <strong>vanishing gradient problem</strong>, which limits their ability to capture long-range dependencies.</p>',
                },
                {
                  type: 'callout',
                  variant: 'info',
                  content: 'LSTMs (Long Short-Term Memory) solve the vanishing gradient problem using a "gate" mechanism that controls the flow of information.',
                },
              ],
            },
          },
        ],
      },
      {
        id: 'block-nlp-2',
        title: {
          es: 'La Arquitectura Transformer',
          en: 'The Transformer Architecture',
        },
        content: {
          es: [
            {
              type: 'text',
              html: '<p>Este bloque cubre la revolución que supuso la arquitectura Transformer en el campo del NLP. Aprenderás el mecanismo de atención, la arquitectura completa y cómo utilizar modelos pre-entrenados con Hugging Face.</p>',
            },
          ],
          en: [
            {
              type: 'text',
              html: '<p>This block covers the revolution brought by the Transformer architecture to the field of NLP. You will learn the attention mechanism, the complete architecture, and how to use pre-trained models with Hugging Face.</p>',
            },
          ],
        },
        lessons: [
          {
            id: 'lesson-nlp-2-1',
            title: {
              es: 'Atención es todo lo que necesitas',
              en: 'Attention is all you need',
            },
            description: { es: '', en: '' },
            topics: [],
            estimatedMinutes: 45,
            content: {
              es: [
                {
                  type: 'text',
                  html: '<h2>Mecanismo de Self-Attention</h2><p>El mecanismo de self-attention permite que cada token en una secuencia "atienda" a todos los demás tokens, capturando relaciones contextuales sin importar la distancia.</p><p>La fórmula clave es: <strong>Attention(Q, K, V) = softmax(QK<sup>T</sup>/√d<sub>k</sub>)V</strong></p>',
                },
                {
                  type: 'video',
                  vimeoId: '76979871',
                  title: 'Visualización de Self-Attention',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'attention.py',
                  code: 'import torch\nimport torch.nn.functional as F\n\ndef scaled_dot_product_attention(Q, K, V):\n    """Implementación de self-attention escalada"""\n    d_k = Q.size(-1)\n    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)\n    weights = F.softmax(scores, dim=-1)\n    return torch.matmul(weights, V), weights',
                },
                {
                  type: 'text',
                  html: '<h2>Arquitectura del Transformer</h2><p>El Transformer consiste en un encoder y un decoder, cada uno compuesto por capas idénticas apiladas.</p><p>Cada capa del encoder tiene:</p><ol><li>Multi-Head Self-Attention</li><li>Feed-Forward Network</li><li>Layer Normalization + Residual Connections</li></ol>',
                },
                {
                  type: 'image',
                  src: '/images/maxymia/transformer-architecture.jpg',
                  alt: 'Diagrama de la arquitectura Transformer',
                  caption: 'Arquitectura del Transformer original (Vaswani et al., 2017)',
                },
              ],
              en: [
                {
                  type: 'text',
                  html: '<h2>Self-Attention Mechanism</h2><p>The self-attention mechanism allows each token in a sequence to "attend" to all other tokens, capturing contextual relationships regardless of distance.</p><p>The key formula is: <strong>Attention(Q, K, V) = softmax(QK<sup>T</sup>/√d<sub>k</sub>)V</strong></p>',
                },
                {
                  type: 'video',
                  vimeoId: '76979871',
                  title: 'Self-Attention Visualization',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'attention.py',
                  code: 'import torch\nimport torch.nn.functional as F\n\ndef scaled_dot_product_attention(Q, K, V):\n    """Scaled self-attention implementation"""\n    d_k = Q.size(-1)\n    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)\n    weights = F.softmax(scores, dim=-1)\n    return torch.matmul(weights, V), weights',
                },
                {
                  type: 'text',
                  html: '<h2>Transformer Architecture</h2><p>The Transformer consists of an encoder and a decoder, each composed of identical stacked layers.</p><p>Each encoder layer has:</p><ol><li>Multi-Head Self-Attention</li><li>Feed-Forward Network</li><li>Layer Normalization + Residual Connections</li></ol>',
                },
                {
                  type: 'image',
                  src: '/images/maxymia/transformer-architecture.jpg',
                  alt: 'Transformer architecture diagram',
                  caption: 'Original Transformer architecture (Vaswani et al., 2017)',
                },
              ],
            },
          },
          {
            id: 'lesson-nlp-2-2',
            title: {
              es: 'Usando Hugging Face Transformers',
              en: 'Using Hugging Face Transformers',
            },
            description: { es: '', en: '' },
            topics: [],
            estimatedMinutes: 40,
            content: {
              es: [
                {
                  type: 'text',
                  html: '<h2>Hugging Face Transformers</h2><p>La librería Transformers de Hugging Face proporciona acceso sencillo a miles de modelos pre-entrenados para NLP, visión y audio.</p>',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'hf_pipeline.py',
                  code: 'from transformers import pipeline\n\n# Análisis de sentimiento\nclassifier = pipeline("sentiment-analysis")\nresult = classifier("Me encanta aprender sobre IA")\nprint(result)  # [{\'label\': \'POSITIVE\', \'score\': 0.99}]\n\n# Generación de texto\ngenerator = pipeline("text-generation", model="gpt2")\ntext = generator("La inteligencia artificial es", max_length=50)\nprint(text[0][\'generated_text\'])',
                },
              ],
              en: [
                {
                  type: 'text',
                  html: '<h2>Hugging Face Transformers</h2><p>The Hugging Face Transformers library provides easy access to thousands of pre-trained models for NLP, vision, and audio.</p>',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'hf_pipeline.py',
                  code: 'from transformers import pipeline\n\n# Sentiment analysis\nclassifier = pipeline("sentiment-analysis")\nresult = classifier("I love learning about AI")\nprint(result)  # [{\'label\': \'POSITIVE\', \'score\': 0.99}]\n\n# Text generation\ngenerator = pipeline("text-generation", model="gpt2")\ntext = generator("Artificial intelligence is", max_length=50)\nprint(text[0][\'generated_text\'])',
                },
              ],
            },
          },
        ],
        exam: {
          id: 'exam-block-nlp-2',
          title: {
            es: 'Examen: Transformer',
            en: 'Exam: Transformer',
          },
          passingScore: 60,
          questions: [
            {
              type: 'single_choice',
              id: 'q-nlp-2-1-1',
              question: {
                es: '¿Cuál es la ventaja principal del mecanismo de atención sobre las RNN?',
                en: 'What is the main advantage of the attention mechanism over RNNs?',
              },
              options: [
                { es: 'Usa menos memoria', en: 'Uses less memory' },
                { es: 'Captura dependencias de largo alcance sin importar la distancia', en: 'Captures long-range dependencies regardless of distance' },
                { es: 'Es más fácil de implementar', en: 'Easier to implement' },
                { es: 'Requiere menos datos', en: 'Requires less data' },
              ],
              correctIndex: 1,
            },
            {
              type: 'ordering',
              id: 'q-nlp-2-1-2',
              question: {
                es: 'Ordena los pasos del cálculo de self-attention:',
                en: 'Order the steps of self-attention computation:',
              },
              items: [
                { es: 'Calcular Q, K, V', en: 'Compute Q, K, V' },
                { es: 'Multiplicar Q por K transpuesta', en: 'Multiply Q by K transposed' },
                { es: 'Escalar y aplicar softmax', en: 'Scale and apply softmax' },
                { es: 'Multiplicar por V', en: 'Multiply by V' },
              ],
              correctOrder: [0, 1, 2, 3],
            },
          ],
        },
      },
    ],
    price: 79,
    language: 'es',
    instructor: {
      name: 'Prof. Carlos Ruiz',
      role: 'Lead NLP Engineer — Maxymia Research',
      avatar: '/images/maxymia/instructor-carlos.jpg',
    },
    level: 'intermediate',
    isPro: true,
    tags: ['NLP', 'transformers', 'hugging face', 'BERT', 'GPT'],
    category: 'nlp',
    rating: 4.5,
    studentCount: 1520,
    originalPrice: 199,
    createdAt: '2025-11-01T00:00:00Z',
    objectives: `- Dominar las arquitecturas Transformer y sus variantes (BERT, GPT, T5)
- Implementar pipelines de procesamiento de texto con Hugging Face
- Desarrollar sistemas de análisis de sentimiento y clasificación de textos
- Crear aplicaciones de generación de texto y resumen automático
- Aplicar técnicas de NLP a casos de uso empresariales`,
    audiences: `- Desarrolladores con conocimientos básicos de Python y machine learning
- Científicos de datos que quieran especializarse en procesamiento de lenguaje
- Ingenieros de software interesados en aplicaciones de texto e IA generativa
- Investigadores que busquen aplicar NLP a sus áreas de estudio`,
    careers: `- Ingeniero de NLP
- Especialista en IA Conversacional
- Desarrollador de Chatbots y Asistentes Virtuales
- Científico de Datos especializado en Texto
- Ingeniero de Búsqueda Semántica`,
  },

  // ── Course 3: Computer Vision (Spanish) ──────────────────────────────
  {
    id: 'course-computer-vision',
    slug: 'computer-vision',
    title: {
      es: 'Computer Vision: De CNNs a Vision Transformers',
      en: 'Computer Vision: From CNNs to Vision Transformers',
    },
    description: {
      es: 'Explora las técnicas fundamentales y avanzadas de visión por computador, desde redes convolucionales hasta modelos multimodales.',
      en: 'Explore fundamental and advanced computer vision techniques, from convolutional networks to multimodal models.',
    },
    thumbnailTitle: {
      es: 'COMPUTER\nVISION',
      en: 'COMPUTER\nVISION',
    },
    image: '/images/maxymia/course-cv.jpg',
    blocks: [
      {
        id: 'block-cv-1',
        title: {
          es: 'Redes Convolucionales',
          en: 'Convolutional Networks',
        },
        content: {
          es: [
            {
              type: 'text',
              html: '<p>Este bloque te introduce a las redes neuronales convolucionales (CNNs), la arquitectura que revolucionó la visión por computador. Aprenderás cómo funcionan las convoluciones, los filtros y las técnicas de pooling.</p>',
            },
          ],
          en: [
            {
              type: 'text',
              html: '<p>This block introduces you to convolutional neural networks (CNNs), the architecture that revolutionized computer vision. You will learn how convolutions, filters, and pooling techniques work.</p>',
            },
          ],
        },
        lessons: [
          {
            id: 'lesson-cv-1-1',
            title: {
              es: 'Fundamentos de CNNs',
              en: 'CNN Fundamentals',
            },
            description: { es: '', en: '' },
            topics: [],
            estimatedMinutes: 35,
            content: {
              es: [
                {
                  type: 'text',
                  html: '<h2>Convoluciones</h2><p>Las convoluciones son la operación fundamental de las CNNs. Un filtro (kernel) se desliza sobre la imagen de entrada, multiplicando y sumando elementos para detectar patrones locales como bordes, texturas y formas.</p>',
                },
                {
                  type: 'video',
                  vimeoId: '76979871',
                  title: 'Cómo funcionan las convoluciones',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'cnn_basic.py',
                  code: 'import torch\nimport torch.nn as nn\n\nclass SimpleCNN(nn.Module):\n    def __init__(self, num_classes=10):\n        super().__init__()\n        self.features = nn.Sequential(\n            nn.Conv2d(3, 32, kernel_size=3, padding=1),\n            nn.ReLU(),\n            nn.MaxPool2d(2),\n            nn.Conv2d(32, 64, kernel_size=3, padding=1),\n            nn.ReLU(),\n            nn.MaxPool2d(2),\n        )\n        self.classifier = nn.Sequential(\n            nn.Flatten(),\n            nn.Linear(64 * 8 * 8, 128),\n            nn.ReLU(),\n            nn.Linear(128, num_classes),\n        )\n    \n    def forward(self, x):\n        x = self.features(x)\n        return self.classifier(x)',
                },
              ],
              en: [
                {
                  type: 'text',
                  html: '<h2>Convolutions</h2><p>Convolutions are the fundamental operation of CNNs. A filter (kernel) slides over the input image, multiplying and summing elements to detect local patterns like edges, textures, and shapes.</p>',
                },
                {
                  type: 'video',
                  vimeoId: '76979871',
                  title: 'How convolutions work',
                },
                {
                  type: 'code',
                  language: 'python',
                  fileName: 'cnn_basic.py',
                  code: 'import torch\nimport torch.nn as nn\n\nclass SimpleCNN(nn.Module):\n    def __init__(self, num_classes=10):\n        super().__init__()\n        self.features = nn.Sequential(\n            nn.Conv2d(3, 32, kernel_size=3, padding=1),\n            nn.ReLU(),\n            nn.MaxPool2d(2),\n            nn.Conv2d(32, 64, kernel_size=3, padding=1),\n            nn.ReLU(),\n            nn.MaxPool2d(2),\n        )\n        self.classifier = nn.Sequential(\n            nn.Flatten(),\n            nn.Linear(64 * 8 * 8, 128),\n            nn.ReLU(),\n            nn.Linear(128, num_classes),\n        )\n    \n    def forward(self, x):\n        x = self.features(x)\n        return self.classifier(x)',
                },
              ],
            },
          },
        ],
        exam: {
          id: 'exam-block-cv-1',
          title: {
            es: 'Examen: Fundamentos de CNNs',
            en: 'Exam: CNN Fundamentals',
          },
          passingScore: 70,
          questions: [
            {
              type: 'single_choice',
              id: 'q-cv-1-1-1',
              question: {
                es: '¿Qué operación reduce las dimensiones espaciales en una CNN?',
                en: 'What operation reduces spatial dimensions in a CNN?',
              },
              options: [
                { es: 'Convolución', en: 'Convolution' },
                { es: 'Pooling', en: 'Pooling' },
                { es: 'ReLU', en: 'ReLU' },
                { es: 'Batch Normalization', en: 'Batch Normalization' },
              ],
              correctIndex: 1,
            },
            {
              type: 'fill_blank',
              id: 'q-cv-1-1-2',
              question: {
                es: 'Un filtro de convolución también se llama ___.',
                en: 'A convolution filter is also called a ___.',
              },
              blanks: [
                { acceptedAnswers: ['kernel', 'núcleo'] },
              ],
            },
          ],
        },
      },
    ],
    price: 69,
    language: 'es',
    instructor: {
      name: 'Dra. María López',
      role: 'Computer Vision Researcher — CSIC',
      avatar: '/images/maxymia/instructor-maria.jpg',
    },
    level: 'advanced',
    isPro: false,
    tags: ['computer vision', 'CNN', 'ViT', 'pytorch'],
    category: 'computer-vision',
    rating: 4.2,
    studentCount: 980,
    originalPrice: 179,
    createdAt: '2026-01-10T00:00:00Z',
    objectives: `- Comprender los fundamentos de la visión por computador y el procesamiento de imágenes
- Implementar redes convolucionales (CNN) y Vision Transformers (ViT) con PyTorch
- Desarrollar sistemas de detección y segmentación de objetos
- Aplicar técnicas de aumento de datos y transfer learning
- Desplegar modelos de visión en producción`,
    audiences: `- Ingenieros de software con interés en visión artificial
- Científicos de datos que quieran expandir sus habilidades a datos visuales
- Investigadores en robótica, automóviles autónomos o sector industrial
- Profesionales del sector médico interesados en análisis de imágenes`,
    careers: `- Ingeniero de Computer Vision
- Desarrollador de Sistemas de Visión Artificial
- Ingeniero de Robótica
- Especialista en Análisis de Imágenes Médicas
- Ingeniero de Vehículos Autónomos`,
  },

  // ── Course: LLMs para Investigación Científica (NEW — test notifications) ──
  {
    id: 'course-llm-research',
    slug: 'llms-investigacion-cientifica',
    title: {
      es: 'LLMs para Investigación Científica',
      en: 'LLMs for Scientific Research',
    },
    description: {
      es: 'Aprende a utilizar modelos de lenguaje a gran escala para acelerar la investigación científica: revisión de literatura, generación de hipótesis y análisis de datos.',
      en: 'Learn to use large language models to accelerate scientific research: literature review, hypothesis generation, and data analysis.',
    },
    thumbnailTitle: {
      es: 'LLMs\nCIENCIA',
      en: 'LLMs\nSCIENCE',
    },
    image: '/images/maxymia/course-ia-fundamentals.jpg',
    blocks: [
      {
        id: 'block-llm-1',
        title: {
          es: 'Introducción a los LLMs',
          en: 'Introduction to LLMs',
        },
        content: {
          es: [{ type: 'text', html: '<p>Exploraremos cómo funcionan los modelos de lenguaje a gran escala y su aplicación en entornos de investigación.</p>' }],
          en: [{ type: 'text', html: '<p>We will explore how large language models work and their application in research environments.</p>' }],
        },
        lessons: [
          {
            id: 'lesson-llm-1-1',
            title: {
              es: '¿Qué son los LLMs?',
              en: 'What are LLMs?',
            },
            description: { es: '', en: '' },
            topics: [],
            estimatedMinutes: 30,
            content: {
              es: [{ type: 'text', html: '<h2>Modelos de Lenguaje a Gran Escala</h2><p>Los LLMs son modelos de aprendizaje profundo entrenados con grandes cantidades de texto que pueden generar, resumir y analizar lenguaje natural con una capacidad sin precedentes.</p>' }],
              en: [{ type: 'text', html: '<h2>Large Language Models</h2><p>LLMs are deep learning models trained on large amounts of text that can generate, summarize, and analyze natural language with unprecedented capability.</p>' }],
            },
          },
          {
            id: 'lesson-llm-1-2',
            title: {
              es: 'Prompting para científicos',
              en: 'Prompting for scientists',
            },
            description: { es: '', en: '' },
            topics: [],
            estimatedMinutes: 25,
            content: {
              es: [{ type: 'text', html: '<h2>Técnicas de Prompting</h2><p>Aprende las mejores técnicas de prompting para obtener resultados precisos en contextos de investigación científica.</p>' }],
              en: [{ type: 'text', html: '<h2>Prompting Techniques</h2><p>Learn the best prompting techniques to get accurate results in scientific research contexts.</p>' }],
            },
          },
        ],
      },
    ],
    price: 59,
    language: 'bilingual',
    instructor: {
      name: 'Dr. Carlos Ruiz',
      role: 'AI Research Lead — Universidad de Granada',
      avatar: '/images/maxymia/instructor-maria.jpg',
    },
    level: 'intermediate',
    isPro: false,
    tags: ['LLM', 'GPT', 'investigación', 'prompting', 'ciencia'],
    category: 'ia',
    rating: 4.8,
    studentCount: 120,
    originalPrice: 129,
    createdAt: '2026-03-01T00:00:00Z',
  },
];
