<div align="center">
  <img width="1200" height="475" alt="Deep Tools Suite Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Deep Tools Suite (Deep SEO Suite)

Bienvenido a la suite unificada de herramientas SEO avanzadas potenciadas por Inteligencia Artificial (Gemini API) y análisis de datos reales. Esta plataforma combina dos potentes herramientas en una única interfaz moderna y responsiva:

1. **Deep SEO Benchmark**: Compara tu sitio web con tus competidores directos analizando datos SEO técnicos y semánticos extraídos en tiempo real del HTML real.
2. **Deep SERP Insights**: Analiza los resultados de búsqueda de Google (SERP) para palabras clave específicas y ubicaciones geográficas, identificando la intención de búsqueda, resúmenes de AI Overviews (SGE), características de la SERP, ofertas de Google Shopping y estrategias recomendadas de posicionamiento.

---

## 🛠️ Requisitos e Instalación

### Prerrequisitos
- **Node.js** (v18 o superior). Se recomienda el uso de [nvm](https://github.com/nvm-sh/nvm) para gestionar versiones de Node.
- Una **API Key de Gemini** activa (puedes obtener una de forma gratuita en [Google AI Studio](https://aistudio.google.com/apikey)).

### Instalación Local

1. **Clonar o situarse en la raíz del proyecto (`Deep_tools`) e instalar dependencias globales y del frontend:**
   ```bash
   npm install
   ```

2. **Instalar dependencias del backend local (crawler):**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Configurar las variables de entorno:**
   En la raíz del proyecto (`Deep_tools`), crea o edita el archivo `.env` con la siguiente variable:
   ```env
   GEMINI_API_KEY=tu_clave_de_api_de_gemini
   ```
   *Nota: El cargador de entornos en `vite.config.ts` está diseñado para leer este archivo unificado desde la raíz utilizando `loadEnv`.*

---

## 🚀 Ejecución del Proyecto

### Desarrollo Local
Para arrancar el frontend de desarrollo (Vite) y el backend de rastreo (Express) de manera simultánea en local, ejecuta el siguiente comando en la raíz del proyecto:
```bash
npm run dev
```
Esto lanzará de forma concurrente:
- **Frontend (Vite)**: accesible en `http://localhost:5173` o `http://localhost:3000`
- **Backend (Express)**: corriendo en `http://localhost:3001`

### Construcción para Producción
Para generar el bundle de producción optimizado del frontend:
```bash
npm run build
```
Los archivos optimizados se guardarán en la carpeta `/dist`.

### Despliegue en Servidores Serverless (Vercel)
El proyecto está configurado para ejecutarse en Vercel sin necesidad de dependencias de servidores tradicionales de Node (como Railway). 
- El frontend se compila como una Single Page Application (SPA).
- El backend de rastreo corre bajo una función serverless en la ruta `api/crawl.ts`.
- Para probar localmente bajo el entorno de Vercel, puedes ejecutar:
  ```bash
  vercel dev
  ```

---

## 📐 Arquitectura de la Aplicación

El proyecto sigue una estructura unificada y modular:

```
Deep_tools/
├── api/
│   └── crawl.ts                     # Handler serverless para Vercel (Producción)
├── backend/
│   ├── server.ts                    # Servidor Express local (Puerto 3001)
│   ├── crawler.ts                   # Lógica de crawling de HTML con Cheerio/Fetch
│   ├── tsconfig.json                # Configuración TypeScript para Node.js
│   └── package.json                 # Dependencias del backend
├── backups/                         # Copias de seguridad del proyecto
├── dist/                            # Build optimizado para producción
├── legacy/                          # Histórico de proyectos antes de la unificación
├── src/
│   ├── components/
│   │   ├── seo-benchmark/           # Componentes visuales de SEO Benchmark
│   │   │   ├── BenchmarkResultsDisplay.tsx
│   │   │   ├── ComparisonTable.tsx
│   │   │   ├── GapsAndInsights.tsx
│   │   │   ├── KeywordAnalysis.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   └── WebsiteCard.tsx
│   │   ├── serp-insights/           # Componentes visuales de SERP Insights
│   │   │   └── SerpInsightsView.tsx
│   │   └── shared/                  # Componentes globales compartidos
│   │       └── Sidebar.tsx          # Menú de navegación lateral
│   ├── services/
│   │   ├── geminiService.ts         # Integración y prompts para SEO Benchmark
│   │   └── serpService.ts           # Integración, prompts y limpieza de URLs para SERP Insights
│   ├── App.tsx                      # Orquestador y selector de vistas
│   ├── main.tsx                     # Entrada principal de React
│   ├── types.ts                     # Interfaces TypeScript comunes
│   └── index.css                    # Estilos globales y tokens de diseño
├── tsconfig.json                    # Configuración TypeScript del frontend
├── vite.config.ts                   # Configuración del empaquetador Vite
├── .env                             # Claves de API y configuración local
└── README.md                        # Documentación técnica (este archivo)
```

---

## 🔎 Detalle Técnico de Módulos

### 1. Deep SEO Benchmark
Su función es la de auditar y comparar técnicamente un sitio web de control contra hasta 5 competidores en paralelo.

* **Extracción de Datos Reales (Capa de Backend)**:
  Para garantizar la veracidad de los datos, **está prohibido que la IA invente datos de SEO** (como meta descripciones o títulos que no existan en el código). El backend realiza un rastreo HTTP real en dos fases:
  1. *Capa de Fetch rápido*: Hace un GET de la URL inyectando headers reales de Chrome (`CHROME_HEADERS`) y parsea el DOM con Cheerio. Toma aproximadamente 1-2 segundos.
  2. *Playwright fallback*: Diseñado originalmente para renderizar páginas SPA pesadas o evadir bloqueos básicos mediante un navegador Headless. *Nota: En la configuración de producción para funciones serverless (Vercel), Playwright está desactivado para no exceder los límites de tamaño de paquete de la plataforma.*

* **Algoritmo de Extracción de Navegación (`extractNav`)**:
  Determina el menú principal de navegación (Header/Menu) de un sitio mediante tres estrategias en cascada:
  1. *Estrategia de Schema*: Analiza los objetos JSON-LD y busca elementos con tipo `SiteNavigationElement`.
  2. *Estrategia de Profundidad DOM (`dom-depth`)*: Localiza el contenedor primario de navegación (`<nav>`, cabeceras, etc.) y calcula la profundidad de los enlaces relativos al contenedor. Encuentra el nivel jerárquico óptimo donde existan al menos 3 enlaces únicos de primer nivel, ignorando menús secundarios o barras utilitarias diminutas.
  3. *Estrategia de Fallback Plano*: Extrae todos los enlaces únicos presentes en elementos con roles de navegación o cabeceras del DOM.

* **Interpretación Semántica con Gemini**:
  * **Resumen de Contenido (`interpretWithGemini`)**: Envía exclusivamente las etiquetas `title`, `metaDescription`, `h1`, `h2s` y `h3s` reales extraídas a `gemini-3-flash-preview` para generar un resumen sin inventar contenido del sitio.
  * **Benchmark Comparativo (`getBenchmarkInsights`)**: Compara los metadatos y resúmenes reales de todos los sitios en paralelo para obtener las brechas de secciones (Gaps), oportunidades de contenido, sugerencias técnicas SEO y una **Matriz de Optimización de Palabras Clave** (que valida la existencia de términos clave en el título, H1, H2s y metadescripciones de cada competidor).

---

### 2. Deep SERP Insights
Analiza el estado de las páginas de resultados de Google (SERP) para palabras clave específicas simulando ubicaciones geográficas exactas.

* **Grounding de Búsqueda de Google**:
  Utiliza el SDK oficial `@google/genai` configurando el modelo `gemini-2.5-flash` con la herramienta `googleSearch` habilitada (`tools: [{ googleSearch: {} }]`). Esto fuerza al modelo a realizar búsquedas reales de Google en tiempo real para respaldar su análisis.

* **Algoritmo de Recuperación de URLs de Grounding (`recoverFullGroundingUrl`)**:
  Por defecto, la API de Grounding de Gemini devuelve enlaces de redirección internos de Vertex AI (`https://vertexaisearch.cloud.google.com/grounding-api-redirect/...`). Para proporcionar enlaces funcionales y legibles al usuario, el servicio implementa una limpieza avanzada en el frontend:
  1. Inspecciona los metadatos de las fuentes devueltas por Gemini (`groundingChunks`).
  2. Realiza comparaciones de prefijos de cadena (Common Prefix Heuristics) y coincidencias de título o dominios entre los resultados devueltos por el texto del modelo y las fuentes reales de grounding.
  3. Recupera la URL destino limpia. En caso de redirecciones del lado del servidor, el endpoint `/api/resolve-url` del backend hace peticiones `HEAD` rápidas con `redirect: 'manual'` para capturar la cabecera `Location` real del destino.

* **Estructura del Output de SERP**:
  El prompt fuerza a Gemini a responder bajo un formato estructurado estricto que luego se parsea con expresiones regulares para generar:
  * **Intención de búsqueda**: Visualización premium tipo dashboard con una barra segmentada con degradados (sky, amber, violet, emerald) y separadores de `2px`, detalle con iconos interactivos de `lucide-react` para cada intención, y un resumen narrativo de la intención (limitado en el prompt de Gemini a un máximo de 25 palabras y expuesto en una burbuja de insight de IA completa).
  * **AI Overview (SGE)**: Si está presente, extrae el resumen de la IA, citas principales y recomendaciones tácticas para ser citado.
  * **SERP Features**: Detección de bloques como People Also Ask, Local Pack, carruseles, etc.
  * **Google Shopping**: Si hay ofertas comerciales orgánicas o de pago, extrae de manera estructurada los productos, precios, nombres de tiendas y sus enlaces limpios.
  * **Resultados Orgánicos**: Tabla completa de las primeras posiciones orgánicas, incluyendo títulos enlazados a su URL real y favicons oficiales de cada dominio.
  * **Estrategia y Contenidos Recomendados**: Sugerencias de Títulos SEO, Meta descripciones y una guía táctica para la palabra clave seleccionada.

* **Estrategia de Resiliencia en Peticiones**:
  Debido a que el modelo en ocasiones puede retornar respuestas vacías al invocar herramientas de búsqueda en ráfagas consecutivas, el cliente implementa una lógica de reintentos progresiva de hasta **3 intentos (Exponential Backoff)**. Adicionalmente, el parser limpia cualquier preámbulo inicial agregado por la IA antes de dividir las secciones del reporte.

* **Parser de Secciones Robusto y Control de Saltos de Línea**:
  El parser de secciones en `serpService.ts` implementa una expresión regular inteligente para `extractSection` que permite capturar de forma robusta las secciones del reporte aun si el formato de cabecera de Gemini varía (soportando niveles `##`, `###`, negritas `**` o nombres traducidos en castellano). Para evitar que los selectores de espacio en blanco consuman saltos de línea y omitan la primera línea de contenido de la sección (causando que el primer valor como `Informational: XX%` o `Suggested Title:` se pierda o muestre "Cargando..."), el parser utiliza específicamente `[ \t]*` (espacios y tabulaciones) en lugar del comodín `\s*` al analizar los límites del encabezado.

* **Chips Interactivos de Inicio Rápido**:
  Para acelerar la adopción por parte del usuario, se agregaron chips clicables con consultas de ejemplo representativas (`zapatillas Nike`, `psicólogo madrid`, `cómo aprender seo`, `receta de tortilla de patatas`) en el estado vacío inicial. Al hacer clic sobre ellos, rellenan automáticamente el buscador y lanzan la auditoría inmediatamente.

* **Skeleton Loaders Estructurados**:
  Se sustituyó el spinner estático central por el componente `SerpInsightsSkeleton` que simula la anatomía exacta del panel final (malla de tarjetas métricas con Búsqueda Local de 1 columna e Intención de Búsqueda de 3 columnas, acordeón para el análisis de competencia, paneles divididos para características de SERP y estrategias SEO, y la tabla de resultados orgánicos). Esto reduce drásticamente el Cumulative Layout Shift (CLS).

* **Mensajería Dinámica de Carga**:
  Un rotador animado cambia automáticamente el mensaje informativo cada 2.5 segundos durante el procesamiento en segundo plano (ej. buscando en Google, estructurando intenciones de usuario, redactando recomendación táctica), lo que reduce el tiempo de espera percibido.

* **Personalización Visual de Encabezados H3**:
  Para las subsecciones del Análisis Narrativo (`### Intención de Búsqueda y SERP Features`, `### Descripción de competencia`, `### Recomendación estratégica`), se inyectó una regla CSS global en `index.html` que formatea las etiquetas `h3` dentro del contenedor de markdown a `1.25em !important` (20px), con peso `700` y color gris oscuro. Esto asegura una jerarquía visual limpia acorde a los estándares del diseño del dashboard.

* **Exportación Ejecutiva a PDF con Paginación Controlada y Branding**:
  El sistema incluye un exportador a PDF integrado en el navegador mediante el comando `window.print()` y estilos dirigidos por `@media print` en `index.css`:
  1. *Branding Premium:* Inyecta un encabezado de impresión exclusivo (`hidden print:flex`) con el logotipo y el branding de "Deep SEO Suite", y el título dinámico *"Reporte de Análisis SERP: [Palabra clave]"*.
  2. *Control de Paginación Firme:* Utiliza clases como `.print-page-break` (`break-before: page !important`) para forzar un orden estructurado de 5 páginas fijas: Página 1 (Métricas e Intenciones), Página 2 (Análisis Narrativo Completo), Página 3 (Estrategia y SERP Features), Página 4-5 (Resultados Orgánicos y Fuentes).
  3. *Prevención de Cortes en Secciones:* Aplica `.print-avoid-break` (`break-inside: avoid !important`) a tarjetas y filas de tablas para impedir que textos compactos o elementos se partan a la mitad entre páginas.
  4. *Evitar Truncamientos y Desbordamientos:* En impresión, la rejilla de métricas colapsa a un flujo vertical de ancho completo (`print:flex print:flex-col print:w-full`) para evitar tarjetas altas y angostas. El valor de "Búsqueda Local" desactiva su truncamiento (`print:whitespace-normal print:overflow-visible`) para mostrar ubicaciones completas (ej. *"España (Madrid)"*). Las tarjetas de características y sugerencias conservan sus bordes y espaciados internos evitando que los textos toquen los bordes del fondo blanco, y los contenedores y wrappers de tablas extensas deshabilitan el truncado por scroll (`print:overflow-visible`) para permitir el flujo multi-página.

* **Exportación Estilo Libre a PowerPoint (.pptx)**:
  Se diseñó un servicio de exportación cliente en TypeScript (`pptxExportService.ts`) utilizando la librería `pptxgenjs`:
  1. *Estilo Neutral:* Genera diapositivas con fondo blanco puro y tipografía Arial estándar sin logotipos ni colores de marca forzados, permitiendo al usuario final aplicar su propia plantilla de diseño corporativo de manera limpia.
  2. *Diseño Panorámico (16:9):* Estructura la presentación en 7 diapositivas widescreen que cubren: Portada, Métricas e Intención de Búsqueda, AI Overview (si aplica), Ofertas de Google Shopping (si aplica), Estrategia SEO y Guía Táctica, SERP Features y Búsquedas Relacionadas, y los Resultados Orgánicos Principales.
  3. *Tabla Compacta Consolidada:* Para asegurar que los 10 competidores orgánicos quepan en una única diapositiva sin desbordarse ni cortarse verticalmente, la tabla orgánica de la diapositiva 7 utiliza tamaños de letra compactos (8-9.5pt) y márgenes de celda eficientes que muestran con claridad la Posición, Título, Dominio y Descripción.
  4. *Sin Consumo de Tokens:* La exportación se realiza de manera 100% programática localmente en el navegador a partir del objeto de resultados estructurado actual, evitando llamadas a APIs de IA y costes innecesarios.

---

## 📋 Reglas y Directrices de Desarrollo

1. **Configuración Unificada**:
   - Todas las variables de entorno deben declararse en el archivo `.env` de la raíz del proyecto.
   - El archivo `vite.config.ts` utiliza la configuración adecuada para servir y leer el `.env` raíz sin duplicar archivos.

2. **Integridad de Datos SEO**:
   - Queda estrictamente prohibido simular o inventar datos SEO ficticios en el backend o frontend. Las herramientas deben operar sobre datos HTML reales extraídos. Si el rastreo falla, se debe notificar al usuario con un error explícito.

3. **Respuestas en Español**:
   - Las respuestas de análisis semántico (SERP Insights, roadmaps, e interpretaciones) deben generarse en castellano/español.

4. **Uso del SDK de Google Gen AI**:
   - El código utiliza exclusivamente el nuevo SDK `@google/genai` instanciando `GoogleGenAI` en lugar de las librerías heredadas `@google/generative-ai`.

---

## 📁 Historial de Backups y Recuperación
El proyecto cuenta con un sistema de snapshots automatizado en la carpeta `/backups` para proteger el código ante fallos catastróficos.
* Para conocer cómo crear o restaurar un backup, revisa el archivo de instrucciones detallado en [backups/README.md](file:///Users/rodrigovillacorta/Documents/Rodrigo/Deep_tools/backups/README.md).
