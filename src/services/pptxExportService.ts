// src/services/pptxExportService.ts

import pptxgen from 'pptxgenjs';
import { SerpAnalysisResult } from '../types';

const getDisplayDomain = (url: string, title: string = ''): string => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'vertexaisearch.cloud.google.com') {
      return parsed.hostname.replace(/^www\./, '');
    }
  } catch (e) {}

  // Fallback: Si es URL de Vertex AI que no se resolvió, estimar desde el título
  if (title) {
    const parts = title.split(/[-|–—]/).map(p => p.trim());
    if (parts.length > 1) {
      const siteName = parts[parts.length - 1].toLowerCase().replace(/\s+/g, '');
      if (siteName.length > 2 && !siteName.includes('aceite')) {
        if (siteName.includes('wikipedia')) return 'wikipedia.org';
        if (siteName.includes('walmart')) return 'walmart.com';
        if (siteName.includes('target')) return 'target.com';
        if (siteName.includes('amazon')) return 'amazon.es';
        if (siteName.includes('ebay')) return 'ebay.es';
        return `${siteName}.com`;
      }
    }
  }
  return 'google.com';
};

export const exportSerpToPptx = (result: SerpAnalysisResult) => {
  const pptx = new pptxgen();
  
  // Configurar formato panorámico 16:9 (por defecto 10x5.625 pulgadas en PptxGenJS)
  pptx.layout = 'LAYOUT_16x9';

  // ----------------------------------------------------
  // DIAPOSITIVA 1: Portada (Estilo minimalista limpio)
  // ----------------------------------------------------
  const slide1 = pptx.addSlide();
  
  slide1.addText(`Reporte de Análisis SERP: ${result.keyword}`, {
    x: 0.8,
    y: 1.8,
    w: 8.4,
    h: 1.5,
    fontSize: 28,
    bold: true,
    fontFace: 'Arial',
    color: '111827'
  });

  const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  slide1.addText(`Ubicación de Consulta: ${result.location}\nFecha de Generación: ${dateStr}`, {
    x: 0.8,
    y: 3.3,
    w: 8.4,
    h: 1.0,
    fontSize: 13,
    fontFace: 'Arial',
    color: '4B5563',
    lineSpacing: 18
  });

  // ----------------------------------------------------
  // DIAPOSITIVA 2: Resumen de Intención y Métricas
  // ----------------------------------------------------
  const slide2 = pptx.addSlide();
  
  slide2.addText('Intención de Búsqueda y Métricas', {
    x: 0.6,
    y: 0.4,
    w: 8.8,
    h: 0.6,
    fontSize: 20,
    bold: true,
    fontFace: 'Arial',
    color: '111827'
  });

  // Columna Izquierda: Valores de Intención
  slide2.addText('Distribución de Intenciones:', {
    x: 0.6,
    y: 1.2,
    w: 4.1,
    h: 0.4,
    fontSize: 13,
    bold: true,
    fontFace: 'Arial',
    color: '374151'
  });

  const intentText = 
    `• Informacional: ${result.intent.informational}%\n\n` +
    `• Navegacional: ${result.intent.navigational}%\n\n` +
    `• Comercial: ${result.intent.commercial}%\n\n` +
    `• Transaccional: ${result.intent.transactional}%`;

  slide2.addText(intentText, {
    x: 0.6,
    y: 1.7,
    w: 4.1,
    h: 3.2,
    fontSize: 12,
    fontFace: 'Arial',
    color: '4B5563'
  });

  // Columna Derecha: Explicación de la Intención
  slide2.addText('Diagnóstico de Intención de Búsqueda:', {
    x: 5.3,
    y: 1.2,
    w: 4.1,
    h: 0.4,
    fontSize: 13,
    bold: true,
    fontFace: 'Arial',
    color: '374151'
  });

  slide2.addText(result.intent.explanation, {
    x: 5.3,
    y: 1.7,
    w: 4.1,
    h: 3.2,
    fontSize: 11,
    fontFace: 'Arial',
    color: '4B5563',
    lineSpacing: 18
  });

  // ----------------------------------------------------
  // DIAPOSITIVA NARRATIVO: Análisis Narrativo Completo
  // ----------------------------------------------------
  const slideNarrative = pptx.addSlide();
  
  slideNarrative.addText('Análisis Narrativo Completo', {
    x: 0.6,
    y: 0.4,
    w: 8.8,
    h: 0.6,
    fontSize: 20,
    bold: true,
    fontFace: 'Arial',
    color: '111827'
  });

  const cleanRawText = result.rawText
    ? result.rawText
        .replace(/###?\s+([^\n]+)/g, '\n$1\n')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .trim()
    : 'No disponible.';

  slideNarrative.addText(cleanRawText, {
    x: 0.6,
    y: 1.1,
    w: 8.8,
    h: 4.1,
    fontSize: 9.0,
    fontFace: 'Arial',
    color: '4B5563',
    lineSpacing: 13
  });

  // ----------------------------------------------------
  // DIAPOSITIVA 3 (AHORA 4): AI Overview (SGE) - Opcional
  // ----------------------------------------------------
  if (result.aiOverview && result.aiOverview.present) {
    const slide3 = pptx.addSlide();
    
    slide3.addText('AI Overview (Google SGE)', {
      x: 0.6,
      y: 0.4,
      w: 8.8,
      h: 0.6,
      fontSize: 20,
      bold: true,
      fontFace: 'Arial',
      color: '111827'
    });

    slide3.addText('Resumen Sintetizado por la IA:', {
      x: 0.6,
      y: 1.2,
      w: 8.8,
      h: 0.4,
      fontSize: 13,
      bold: true,
      fontFace: 'Arial',
      color: '374151'
    });

    const overviewText = result.aiOverview.summary || result.aiOverview.extract || 'Información no disponible.';
    slide3.addText(overviewText, {
      x: 0.6,
      y: 1.6,
      w: 8.8,
      h: 2.0,
      fontSize: 10.5,
      fontFace: 'Arial',
      color: '4B5563',
      lineSpacing: 16
    });

    if (result.aiOverview.citationRecommendation) {
      slide3.addText('Recomendación Estratégica de Citación:', {
        x: 0.6,
        y: 3.8,
        w: 8.8,
        h: 0.3,
        fontSize: 12,
        bold: true,
        fontFace: 'Arial',
        color: '374151'
      });

      slide3.addText(result.aiOverview.citationRecommendation, {
        x: 0.6,
        y: 4.2,
        w: 8.8,
        h: 0.9,
        fontSize: 10.5,
        fontFace: 'Arial',
        color: '1F2937',
        italic: true
      });
    }
  }

  // ----------------------------------------------------
  // DIAPOSITIVA 4: Google Shopping - Opcional
  // ----------------------------------------------------
  if (result.shoppingAnalysis && result.shoppingAnalysis.present) {
    const slide4 = pptx.addSlide();
    
    slide4.addText('Análisis de Resultados de Google Shopping', {
      x: 0.6,
      y: 0.4,
      w: 8.8,
      h: 0.6,
      fontSize: 20,
      bold: true,
      fontFace: 'Arial',
      color: '111827'
    });

    slide4.addText(result.shoppingAnalysis.insight, {
      x: 0.6,
      y: 1.1,
      w: 8.8,
      h: 0.8,
      fontSize: 11,
      fontFace: 'Arial',
      color: '4B5563',
      lineSpacing: 16
    });

    const products = result.shoppingAnalysis.products || [];
    if (products.length > 0) {
      slide4.addText('Ofertas y Productos Relevantes Detectados:', {
        x: 0.6,
        y: 2.0,
        w: 8.8,
        h: 0.3,
        fontSize: 12,
        bold: true,
        fontFace: 'Arial',
        color: '374151'
      });

      const shoppingRows: any[] = [
        [
          { text: 'Producto', options: { bold: true, fill: { color: 'F3F4F6' }, fontFace: 'Arial', fontSize: 10, color: '111827' } },
          { text: 'Precio', options: { bold: true, fill: { color: 'F3F4F6' }, fontFace: 'Arial', fontSize: 10, color: '111827' } },
          { text: 'Tienda', options: { bold: true, fill: { color: 'F3F4F6' }, fontFace: 'Arial', fontSize: 10, color: '111827' } }
        ]
      ];

      products.forEach(p => {
        shoppingRows.push([
          { text: p.title, options: { fontSize: 9, fontFace: 'Arial', color: '4B5563' } },
          { text: p.price, options: { fontSize: 9, fontFace: 'Arial', color: '4B5563' } },
          { text: p.website, options: { fontSize: 9, fontFace: 'Arial', color: '4B5563' } }
        ]);
      });

      // Añadir la tabla de Shopping ajustada a 8.8 de ancho
      slide4.addTable(shoppingRows, {
        x: 0.6,
        y: 2.4,
        w: 8.8,
        h: 2.6,
        colW: [4.8, 1.5, 2.5],
        border: { type: 'solid', pt: 1, color: 'E5E7EB' }
      });
    }
  }

  // ----------------------------------------------------
  // DIAPOSITIVA 5: Estrategia SEO Sugerida
  // ----------------------------------------------------
  const slide5 = pptx.addSlide();
  
  slide5.addText('Estrategia SEO Sugerida', {
    x: 0.6,
    y: 0.4,
    w: 8.8,
    h: 0.6,
    fontSize: 20,
    bold: true,
    fontFace: 'Arial',
    color: '111827'
  });

  // Meta Title y Meta Description (Columna Izquierda)
  slide5.addText('Meta Tags Recomendados:', {
    x: 0.6,
    y: 1.2,
    w: 4.1,
    h: 0.3,
    fontSize: 12,
    bold: true,
    fontFace: 'Arial',
    color: '374151'
  });

  slide5.addText('Meta Title Sugerido:', {
    x: 0.6,
    y: 1.6,
    w: 4.1,
    h: 0.2,
    fontSize: 10,
    bold: true,
    fontFace: 'Arial',
    color: '6B7280'
  });
  slide5.addText(result.suggestions.title || 'No especificado', {
    x: 0.6,
    y: 1.9,
    w: 4.1,
    h: 0.6,
    fontSize: 11,
    bold: true,
    fontFace: 'Arial',
    color: '111827'
  });

  slide5.addText('Meta Description Sugerida:', {
    x: 0.6,
    y: 2.7,
    w: 4.1,
    h: 0.2,
    fontSize: 10,
    bold: true,
    fontFace: 'Arial',
    color: '6B7280'
  });
  slide5.addText(result.suggestions.metaDescription || 'No especificado', {
    x: 0.6,
    y: 3.0,
    w: 4.1,
    h: 1.0,
    fontSize: 10.5,
    fontFace: 'Arial',
    color: '4B5563',
    lineSpacing: 15
  });

  // Guía Táctica (Columna Derecha)
  slide5.addText('Guía Táctica:', {
    x: 5.3,
    y: 1.2,
    w: 4.1,
    h: 0.3,
    fontSize: 12,
    bold: true,
    fontFace: 'Arial',
    color: '374151'
  });

  // Limpiar markdown básico y estructurarlo como viñetas limpias
  const cleanTactics = result.suggestions.strategy
    ? result.suggestions.strategy
        .replace(/###?\s+[^\n]+/g, '') // Quitar títulos de sección
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Quitar asteriscos de negrita
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
    : 'No especificada.';

  slide5.addText(cleanTactics, {
    x: 5.3,
    y: 1.6,
    w: 4.1,
    h: 3.5,
    fontSize: 9.5,
    fontFace: 'Arial',
    color: '4B5563',
    lineSpacing: 14
  });

  // ----------------------------------------------------
  // DIAPOSITIVA 6: SERP Features y Búsquedas Relacionadas
  // ----------------------------------------------------
  const slide6 = pptx.addSlide();
  
  slide6.addText('SERP Features y Búsquedas Relacionadas', {
    x: 0.6,
    y: 0.4,
    w: 8.8,
    h: 0.6,
    fontSize: 20,
    bold: true,
    fontFace: 'Arial',
    color: '111827'
  });

  // SERP Features (Columna Izquierda)
  slide6.addText('Características de la SERP Detectadas:', {
    x: 0.6,
    y: 1.2,
    w: 4.1,
    h: 0.3,
    fontSize: 12,
    bold: true,
    fontFace: 'Arial',
    color: '374151'
  });

  const featuresList = result.features && result.features.length > 0
    ? result.features.map(f => `• ${f.name}: ${f.description}`).join('\n\n')
    : 'No se detectaron características especiales.';

  slide6.addText(featuresList, {
    x: 0.6,
    y: 1.7,
    w: 4.1,
    h: 3.4,
    fontSize: 9.5,
    fontFace: 'Arial',
    color: '4B5563'
  });

  // Búsquedas Relacionadas (Columna Derecha)
  slide6.addText('Búsquedas Relacionadas:', {
    x: 5.3,
    y: 1.2,
    w: 4.1,
    h: 0.3,
    fontSize: 12,
    bold: true,
    fontFace: 'Arial',
    color: '374151'
  });

  const keywordsList = result.relatedKeywords && result.relatedKeywords.length > 0
    ? result.relatedKeywords.map(k => `• ${k}`).join('\n\n')
    : 'No se detectaron búsquedas relacionadas.';

  slide6.addText(keywordsList, {
    x: 5.3,
    y: 1.7,
    w: 4.1,
    h: 3.4,
    fontSize: 10.5,
    fontFace: 'Arial',
    color: '4B5563'
  });

  // ----------------------------------------------------
  // DIAPOSITIVA 7: Resultados Orgánicos Principales (Top 10)
  // ----------------------------------------------------
  // Se diseña una tabla compacta con letra de 8-8.5pt para que quepa todo en una sola slide
  const slide7 = pptx.addSlide();
  
  slide7.addText('Resultados Orgánicos Principales (Top 10)', {
    x: 0.6,
    y: 0.4,
    w: 8.8,
    h: 0.5,
    fontSize: 20,
    bold: true,
    fontFace: 'Arial',
    color: '111827'
  });

  const organicTableRows: any[] = [
    [
      { text: 'Pos', options: { bold: true, fill: { color: 'F3F4F6' }, fontFace: 'Arial', fontSize: 9.5, color: '111827', align: 'center' } },
      { text: 'Resultado (Título y Dominio)', options: { bold: true, fill: { color: 'F3F4F6' }, fontFace: 'Arial', fontSize: 9.5, color: '111827' } },
      { text: 'Descripción (Snippet en la SERP)', options: { bold: true, fill: { color: 'F3F4F6' }, fontFace: 'Arial', fontSize: 9.5, color: '111827' } }
    ]
  ];

  result.organicResults.forEach((res, i) => {
    const domain = getDisplayDomain(res.url, res.title);

    organicTableRows.push([
      { text: `${i + 1}`, options: { fontSize: 8.5, fontFace: 'Arial', color: '374151', align: 'center' } },
      { text: `${res.title}\n(${domain})`, options: { fontSize: 8.5, fontFace: 'Arial', bold: true, color: '2563EB' } },
      { text: res.description || 'Sin descripción disponible.', options: { fontSize: 8, fontFace: 'Arial', color: '4B5563' } }
    ]);
  });

  // Añadir la tabla ocupando la mayor parte del espacio de la diapositiva
  slide7.addTable(organicTableRows, {
    x: 0.6,
    y: 1.0,
    w: 8.8,
    h: 4.1,
    colW: [0.5, 3.3, 5.0],
    border: { type: 'solid', pt: 1, color: 'E5E7EB' },
    valign: 'middle'
  });

  // Generar y descargar el archivo
  const sanitizedKeyword = result.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const fileName = `analisis_serp_${sanitizedKeyword}.pptx`;
  
  pptx.writeFile({ fileName });
};
