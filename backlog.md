# Backlog de Desarrollo - Deep SEO Suite

Este archivo contiene el listado de tareas pendientes y terminadas para optimizar la interfaz (UI/UX), funcionalidades y rendimiento de la suite de herramientas.

---

## 1. Tareas Globales

- [x] **Definir tokens de diseño unificados**: Unificar la paleta de colores premium (HSL/gradientes suaves), tipografías y sombras a través de Tailwind CSS y variables CSS globales.
- [x] **Mejorar navegación de Sidebar**: Optimizar los efectos hover y la responsividad móvil/escritorio de la barra lateral compartida.
- [ ] **Layout responsivo general**: Asegurar que las vistas se adapten perfectamente a pantallas medianas y de tabletas sin desbordamiento horizontal.

---

## 2. Módulo SERP Insights

- [x] **Reubicación de "Análisis Narrativo Completo" al inicio**: Subir la sección a la parte superior de los resultados (justo debajo de las tarjetas de métricas) en formato de acordeón cerrado por defecto.
  - *Objetivo:* Dar acceso inmediato a los insights estratégicos de alto valor para consultoría SEO sin necesidad de hacer scroll.
- [x] **Renderizado de Markdown**: Integrar y aplicar `react-markdown` y `remark-gfm` sobre el Análisis Narrativo y la Guía Táctica.
  - *Objetivo:* Dar formato enriquecido (negritas, listas, subtítulos) a los textos devueltos por la IA, mejorando sustancialmente la legibilidad.
- [ ] **Botones de "Copiar al portapapeles"**: Añadir un botón rápido e intuitivo al lado del Meta Title, Meta Description y resúmenes estratégicos optimizados.
  - *Objetivo:* Facilitar la exportación directa y rápida de las recomendaciones a informes o CMS.
- [x] **Enlaces clickables en resultados orgánicos**: Envolver el título de cada resultado orgánico en un enlace HTML real (`<a>`) que se abra en una nueva pestaña.
  - *Objetivo:* Mejorar la navegación natural y la interacción del usuario al inspeccionar competidores directos.
- [x] **Visualización de Favicons**: Obtener y mostrar el favicon oficial del dominio de cada competidor junto a su URL en la tabla de posiciones principales.
  - *Objetivo:* Crear una interfaz más auténtica, que simule visualmente una SERP real de Google y reduzca la carga cognitiva.
- [x] **Rediseño del gráfico de Intención de Búsqueda**: Reemplazar la barra bicolor simple por un gráfico más refinado y moderno, soportando la categorización de 4 tipos estándar (Informacional, Navegacional, Comercial, Transaccional).
  - *Objetivo:* Alinear el diagnóstico con los estándares y la estética de las suites SEO profesionales del mercado.
- [x] **Reemplazo de métrica redundante**: Sustituir la tarjeta de "Palabra Clave" en la rejilla superior por una métrica analítica nueva (ej. "Complejidad de SERP" o "Tipo de Intención Dominante").
  - *Objetivo:* Eliminar redundancias de información (ya que el término de búsqueda se muestra en la barra superior) y maximizar el valor de la pantalla.
- [x] **Ejemplos de inicio rápido (Chips interactivos)**: Introducir chips clickables en el estado previo a la búsqueda con términos de ejemplo representativos (ej. "zapatillas Nike", "psicólogo madrid", "cómo aprender seo", "receta de tortilla de patatas").
  - *Objetivo:* Incentivar la interacción del usuario desde el primer segundo y mostrar el potencial de tipos de búsquedas del módulo.
- [x] **Gestión discreta de geolocalización**: Quitar el prompt automático de ubicación al cargar la página. Añadir selectores manuales de país/idioma junto con un botón opcional de *"Usar mi ubicación actual"*. Establecer Madrid, España como geolocalización predeterminada.
  - *Objetivo:* Evitar solicitudes intrusivas a nivel de navegador y dar mayor control sobre la simulación de SERPs geolocalizadas.
- [x] **Enriquecimiento de Tarjetas de Métricas**: Agregar la lista de características detectadas en la tarjeta de Características SERP y geocodificación inversa para nombres legibles en Búsqueda Local (GPS).
  - *Objetivo:* Mejorar la granularidad visual de los elementos especiales del SERP y ofrecer nombres de ubicaciones legibles en lugar de coordenadas.
- [x] **Skeleton Loaders y estados dinámicos de carga**: Reemplazar el spinner central estático por skeletons de carga estructurados (que imiten el layout final) y un texto de estado que rote explicando la fase del backend en tiempo real.
  - *Objetivo:* Mejorar el rendimiento percibido (perceived performance) y mitigar el Cumulative Layout Shift (CLS) durante las peticiones a la API.
- [x] **Estructura ejecutiva para el Análisis Narrativo**: Mejorar el prompt de Gemini para estructurar el "Análisis narrativo completo" en secciones estándar obligatorias mediante encabezados claros, subtítulos y listas de viñetas (bullet points) para que sea un reporte más ejecutivo y fácil de presentar.
  - *Objetivo:* Evitar textos extensos en bloques continuos y estandarizar la presentación de insights competitivos.
- [x] **Exportación a PDF con Estructuración Ejecutiva**: Desarrollar un botón de exportación para generar reportes ejecutivos en formato PDF.
  - *Detalles:* Incluye branding unificado de "Deep SEO Suite", diseño de rejilla adaptativo en impresión (flex-col para tarjetas métricas en Página 1), paginación controlada mediante saltos de página lógicos, prevención de cortes a la mitad en secciones compactas (`break-inside: avoid`), visualización completa de tablas extensas y corrección de desbordamientos.
- [x] **Exportación a PowerPoint (.pptx) Estilo Libre**: Desarrollar la exportación del reporte a formato PowerPoint widescreen 16:9 sin branding ni estilos de colores agresivos para que el usuario añada su propia plantilla.
  - *Detalles:* Generado localmente en cliente mediante pptxgenjs sin llamadas de IA ni consumo de tokens. Incluye 7 slides cubriendo intenciones de búsqueda, AI Overview (opcional), ofertas de Shopping (opcional), estrategias recomendadas, SERP features, palabras clave relacionadas y el Top 10 orgánico ajustado en una sola tabla compacta de 8-9.5pt.
- [ ] **Optimización del tiempo de carga**: Optimizar el procesamiento de peticiones y respuestas con Gemini (reduciendo latencias de raspado y grounding) para agilizar el análisis cuando existen múltiples tipos de resultados.
  - *Objetivo:* Reducir el tiempo de espera percibido en búsquedas complejas.

---

## 3. Módulo SEO Benchmark

- [ ] **Optimización del flujo de carga y Skeletons**: Implementar estados de carga progresivos para la comparación de múltiples competidores.
- [ ] **Comparador visual de etiquetas meta**: Crear tarjetas visuales paralelas que contrasten de forma clara el Title, Description y jerarquía de encabezados (H1-H3) de todas las URLs analizadas.
- [ ] **Reporte visual de brechas de contenido**: Diseñar paneles interactivos para destacar los términos y temáticas cubiertas por la competencia que el usuario no tiene en su web.
