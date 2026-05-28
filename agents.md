# Deep_tools - Reglas de Agentes y Arquitectura

Este archivo define las reglas generales, objetivos y configuración para el desarrollo y mantenimiento de las herramientas en la carpeta `Deep_tools`.

## Proyectos Disponibles

### 1. Deep SEO Benchmark (`deep-seo-benchmark`)
- **Objetivo**: Automatizar el proceso de benchmark competitivo de un agente SEO.
- **Funcionamiento**: El usuario introduce dominios/URLs y palabras clave. El backend realiza un scraping real del HTML (título, meta descripción, H1/H2/H3, schema markup, etc.) usando fetch y Playwright (como fallback). Luego, Gemini interpreta el contenido para extraer resúmenes y generar insights competitivos/gaps de contenido.
- **Modelo de IA**: `gemini-2.5-flash` / `gemini-3-flash-preview`.

### 2. Deep SERP Insights (`deep-serp-insights`)
- **Objetivo**: Analizar los resultados de búsqueda de Google (SERP) para palabras clave específicas y ubicaciones geográficas.
- **Funcionamiento**: Utiliza Gemini con la herramienta Google Search habilitada para analizar la intención de búsqueda, resúmenes de AI Overviews, SERP features, resultados orgánicos, y generar estrategias SEO recomendadas.
- **Modelo de IA**: `gemini-2.5-flash`.

---

## Reglas y Directrices de Desarrollo

1. **Configuración Unificada**:
   - Ambos proyectos deben leer su configuración de API key de Gemini desde el archivo `.env` ubicado en la raíz de `Deep_tools` (`/Users/rodrigovillacorta/Documents/Rodrigo/Deep_tools/.env`).
   - El archivo `vite.config.ts` de cada proyecto está configurado para cargar variables de entorno usando `loadEnv(mode, path.resolve(__dirname, '..'), '')`.
   - La variable de entorno requerida es `GEMINI_API_KEY`.

2. **Acceso a Datos Reales (SEO Benchmark)**:
   - Está prohibido que la IA invente datos de SEO (como etiquetas meta o títulos) que no estén presentes en el HTML real. El flujo de crawling real por backend debe respetarse estrictamente.

3. **Respuestas en Español (SERP Insights)**:
   - Para el análisis de SERP, las respuestas de Gemini deben generarse en castellano (español de España), estructuradas bajo los encabezados requeridos para su correcto parseo en el frontend.

4. **Uso del SDK de Google Gen AI**:
   - Ambos proyectos utilizan el nuevo SDK oficial de Google Gen AI (`@google/genai`) importando `GoogleGenAI`.

5. **Despliegues y Push a Producción**:
   - Está estrictamente prohibido que la IA intente hacer `git push` al repositorio remoto de producción a menos que el usuario lo solicite de manera explícita y directa.
