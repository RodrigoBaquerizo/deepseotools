
import { GoogleGenAI } from "@google/genai";
import { SerpAnalysisResult } from "../types";

const MODEL_NAME = 'gemini-2.5-flash';

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:3001');

const recoverFullGroundingUrl = (parsedUrl: string, groundingChunks: any[], resultTitle?: string): string => {
  if (!parsedUrl) return parsedUrl;

  const trimmedUrl = parsedUrl.trim();

  // Case 1: It is a Vertex AI Search Grounding redirect URL
  if (trimmedUrl.startsWith('https://vertexaisearch.cloud.google.com/grounding-api-redirect/')) {
    const cleanUrl = trimmedUrl.replace(/\.+$|\s+$/g, '');
    let bestMatchUrl = cleanUrl;
    let maxCommonPrefixLength = 0;

    for (const chunk of groundingChunks) {
      const chunkUrl = chunk.web?.uri;
      if (!chunkUrl) continue;

      let commonLength = 0;
      const minLen = Math.min(cleanUrl.length, chunkUrl.length);
      for (let i = 0; i < minLen; i++) {
        if (cleanUrl[i] === chunkUrl[i]) {
          commonLength++;
        } else {
          break;
        }
      }

      if (commonLength > maxCommonPrefixLength) {
        maxCommonPrefixLength = commonLength;
        bestMatchUrl = chunkUrl;
      }
    }

    if (maxCommonPrefixLength > 75) {
      return bestMatchUrl;
    }
    return cleanUrl;
  }

  // Case 2: It is a valid direct HTTP/S URL
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }

  // Case 3: It is NOT a valid URL (e.g. "Olivarte", "No especificado", etc.)
  // Let's see if we can match it with a grounding chunk by domain/title
  const query = trimmedUrl.toLowerCase();
  const blacklisted = ['no especificado', 'no disponible', 'n/a', 'no hay', 'ver web', '#', 'result'];
  if (query && !blacklisted.some(b => query.includes(b))) {
    for (const chunk of groundingChunks) {
      const chunkTitle = (chunk.web?.title || '').toLowerCase();
      const chunkUri = (chunk.web?.uri || '').toLowerCase();
      if (chunkTitle.includes(query) || chunkUri.includes(query)) {
        return chunk.web.uri;
      }
    }
  }

  // Case 4: Fallback to match by resultTitle if provided
  if (resultTitle) {
    const titleQuery = resultTitle.toLowerCase();
    for (const chunk of groundingChunks) {
      const chunkTitle = (chunk.web?.title || '').toLowerCase();
      const chunkUri = (chunk.web?.uri || '').toLowerCase();
      
      // If result title matches the chunk title or contains key words
      if (chunkTitle && (titleQuery.includes(chunkTitle) || chunkTitle.includes(titleQuery))) {
        return chunk.web.uri;
      }
      
      // Extract domain from chunk uri and check if it's in the result title
      try {
        const domain = new URL(chunk.web.uri).hostname.replace('www.', '').split('.')[0];
        if (domain && domain.length > 3 && titleQuery.includes(domain)) {
          return chunk.web.uri;
        }
      } catch (e) {}
    }
  }

  return trimmedUrl;
};

const resolveRedirectUrl = async (url: string): Promise<string> => {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return url;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/resolve-url?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = await res.json();
      return data.resolvedUrl || url;
    }
  } catch (e) {
    console.error("Error resolving URL through backend:", e);
  }
  return url;
};

export const analyzeSerp = async (
  keyword: string,
  locationContext?: { lat: number; lng: number }
): Promise<SerpAnalysisResult> => {
  // La guía oficial dice: "Always use process.env.GEMINI_API_KEY for the Gemini API"
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.length < 10 || apiKey.startsWith('MY_')) {
    throw new Error("API Key no detectada o no válida. Por favor, asegúrate de haber seleccionado una clave en el diálogo de AI Studio.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const locationString = locationContext 
    ? `latitud: ${locationContext.lat}, longitud: ${locationContext.lng}`
    : "ubicación global (no especificada)";

  const prompt = `
    IMPORTANTE: Responde SIEMPRE en castellano (español de España). Todo el texto narrativo, explicaciones, resúmenes, recomendaciones, estrategias e insights deben estar escritos en castellano. Los valores estructurales como "Yes/No", porcentajes, URLs y títulos de páginas web pueden mantenerse en su idioma original.

    Analiza los resultados de búsqueda de Google (SERP) para: "${keyword}".
    Ubicación: ${locationString}.

    PROPORCIONA TU RESPUESTA SIGUIENDO ESTA ESTRUCTURA EXACTA (usa los encabezados tal cual):

    ## INTENTION
    Transactional: [Porcentaje]%
    Informational: [Porcentaje]%
    Explanation: [Breve explicación en castellano de la intención predominante]

    ## AI_OVERVIEW
    Present: [Yes/No]
    Summary: [Resumen en castellano del contenido generado por la IA]
    Extract: [Un fragmento textual o extracto representativo de lo que muestra el AI Overview]
    Sources: [Título | URL], [Título | URL]...
    Citation Recommendation: [Consejos específicos en castellano para que una web sea citada por la IA para esta keyword]

    ## FEATURES
    Feature: [Nombre] | [Descripción corta en castellano]
    Feature: [Nombre] | [Descripción corta en castellano]
    ...

    ## ORGANIC
    Result: [Título] | [URL] | [Meta Descripción]
    Result: [Título] | [URL] | [Meta Descripción]
    ...

    ## STRATEGY
    Suggested Title: [Título propuesto]
    Suggested Meta: [Meta descripción propuesta]
    Strategy: [Resumen en castellano de la estrategia para posicionar]

    ## RELATED
    Keywords: [Palabra 1], [Palabra 2], [Palabra 3]...

    ## SHOPPING
    Present: [Yes/No] (Escribe Yes si detectas cualquier tipo de producto, bloque de shopping, carrusel de productos, ofertas orgánicas de tiendas o listados de productos en los resultados. En caso contrario escribe No)
    Product: [Título del Producto] | [Precio (o "No especificado" si no aparece)] | [URL de la tienda] | [Nombre de la Tienda/Web]
    Product: [Título del Producto] | [Precio (o "No especificado" si no aparece)] | [URL de la tienda] | [Nombre de la Tienda/Web]
    ...
    Insight: [Breve análisis estratégico en castellano de los productos y precios encontrados]

    IMPORTANTE PARA SHOPPING:
    - Si "Present" es No, no escribas ninguna línea que empiece por "Product:". Escribe únicamente "Present: No" e "Insight: No se detectaron productos...".
    - No inventes productos. Extrae solo los que aparezcan en los resultados de búsqueda.
    - Cada línea de "Product:" debe tener exactamente 4 campos separados por el carácter "|".

    ## FULL_REPORT
    [Aquí incluye en castellano tu análisis narrativo detallado y completo del SERP]
  `;

  const MAX_RETRIES = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";

      // Gemini occasionally returns 200 OK with no text (only groundingMetadata).
      // Detect this and retry instead of silently showing empty results.
      if (!text || text.trim().length < 50) {
        console.warn(`[DeepSERP] Attempt ${attempt}/${MAX_RETRIES}: Gemini returned empty or near-empty text. Retrying...`);
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 1000 * attempt)); // 1s, 2s backoff
          continue;
        }
        throw new Error("Gemini devolvió una respuesta vacía tras varios intentos. Inténtalo de nuevo.");
      }

    // Strip any preamble before the first ## heading so section extraction always works
    // even when Gemini adds introductory text like "¡Claro! Aquí tienes el análisis:"
    const firstHeading = text.indexOf('##');
    const cleanText = firstHeading > 0 ? text.slice(firstHeading) : text;

    // Parsing Logic
    const extractSection = (name: string) => {
      const regex = new RegExp(`## ${name}([\\s\\S]*?)(?=##|$)`, 'i');
      return regex.exec(cleanText)?.[1]?.trim() || "";
    };

    const intentSection = extractSection("INTENTION");
    const aiSection = extractSection("AI_OVERVIEW");
    const featuresSection = extractSection("FEATURES");
    const organicSection = extractSection("ORGANIC");
    const strategySection = extractSection("STRATEGY");
    const relatedSection = extractSection("RELATED");
    const shoppingSection = extractSection("SHOPPING");
    const fullReport = extractSection("FULL_REPORT");

    const parseList = (section: string, prefix: string) => {
      return section.split('\n')
        .filter(line => line.trim().startsWith(prefix))
        .map(line => line.trim().replace(prefix, '').trim());
    };

    const transactional = parseInt(intentSection.match(/Transactional:\s*(\d+)/)?.[1] || "0");
    const informational = parseInt(intentSection.match(/Informational:\s*(\d+)/)?.[1] || "0");
    const intentExpl = intentSection.match(/Explanation:\s*(.*)/)?.[1] || "";

    const aiPresent = aiSection.match(/Present:\s*Yes/i) !== null;
    const aiSummary = aiSection.match(/Summary:\s*([\s\S]*?)(?=Extract:|$)/i)?.[1]?.trim() || "";
    const aiExtract = aiSection.match(/Extract:\s*([\s\S]*?)(?=Sources:|$)/i)?.[1]?.trim() || "";
    const aiSourcesRaw = aiSection.match(/Sources:\s*(.*)/i)?.[1] || "";
    const aiSources = aiSourcesRaw.split(',').filter(s => s.includes('|')).map(s => {
      const [title, url] = s.split('|').map(p => p.trim());
      return { title, url };
    });
    const aiCitationRecommendation = aiSection.match(/Citation Recommendation:\s*([\s\S]*?)$/i)?.[1]?.trim() || "";

    const features = parseList(featuresSection, "Feature:").map(f => {
      const [name, description] = f.split('|').map(p => p.trim());
      return { name, description };
    });

    const organic = parseList(organicSection, "Result:").map(o => {
      const parts = o.split('|').map(p => p.trim());
      const urlIndex = parts.findIndex(p => p.startsWith('http://') || p.startsWith('https://'));
      if (urlIndex !== -1) {
        const title = parts.slice(0, urlIndex).join(' | ');
        const url = parts[urlIndex];
        const description = parts.slice(urlIndex + 1).join(' | ');
        return { title, url, description };
      }
      const [title, url, description] = parts;
      return { title: title || "", url: url || "", description: description || "" };
    });

    const suggestedTitle = strategySection.match(/Suggested Title:\s*(.*)/i)?.[1] || "";
    const suggestedMeta = strategySection.match(/Suggested Meta:\s*(.*)/i)?.[1] || "";
    const strategyBody = strategySection.match(/Strategy:\s*([\s\S]*?)$/i)?.[1]?.trim() || "";

    // Diagnostic: warn if critical sections parsed as empty so devs can inspect the raw response
    if (!intentSection || !strategySection || organic.length === 0) {
      console.warn('[DeepSERP] Parser warning — one or more critical sections are empty. Raw Gemini response:');
      console.warn(text);
    }

    const related = relatedSection.match(/Keywords:\s*(.*)/i)?.[1]?.split(',').map(k => k.trim()) || [];

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const shoppingPresentRaw = shoppingSection.match(/Present:\s*Yes/i) !== null;
    const shoppingProductsRaw = parseList(shoppingSection, "Product:").map(p => {
      const parts = p.split('|').map(part => part.trim());
      const urlIndex = parts.findIndex(part => part.startsWith('http://') || part.startsWith('https://'));
      if (urlIndex !== -1 && urlIndex >= 2) {
        const title = parts.slice(0, urlIndex - 1).join(' | ');
        const price = parts[urlIndex - 1];
        const url = parts[urlIndex];
        const website = parts.slice(urlIndex + 1).join(' | ');
        return { title, price, url, website: website || "Ver Web" };
      }
      const [title, price, url, website] = parts;
      return { title: title || "", price: price || "", url: url || "", website: website || "Ver Web" };
    });
    const shoppingInsight = shoppingSection.match(/Insight:\s*(.*)/i)?.[1] || "";

    const groundingLinksRaw = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Enlace de búsqueda",
        url: chunk.web?.uri || "#"
      }));

    // 1. Recover full non-truncated URLs from grounding chunks metadata
    const recoveredOrganic = organic.map(item => ({
      ...item,
      url: recoverFullGroundingUrl(item.url, groundingChunks, item.title)
    }));
    const recoveredShoppingProducts = shoppingProductsRaw.map(item => ({
      ...item,
      url: recoverFullGroundingUrl(item.url, groundingChunks, item.title)
    }));
    const recoveredAiSources = aiSources.map(item => ({
      ...item,
      url: recoverFullGroundingUrl(item.url, groundingChunks, item.title)
    }));
    const recoveredGroundingLinks = groundingLinksRaw.map(item => ({
      ...item,
      url: recoverFullGroundingUrl(item.url, groundingChunks, item.title)
    }));

    // 2. Filter out products that have invalid URLs or are templates/warnings
    const validShoppingProducts = recoveredShoppingProducts.filter(item => 
      item.url && 
      (item.url.startsWith('http://') || item.url.startsWith('https://')) && 
      !item.title.toLowerCase().includes('no se ') && 
      !item.title.toLowerCase().includes('no hay ')
    );

    const shoppingPresent = shoppingPresentRaw && validShoppingProducts.length > 0;

    // 3. Resolve all Google Search Grounding redirect URLs in parallel
    const [
      resolvedOrganic,
      resolvedShoppingProducts,
      resolvedAiSources,
      resolvedGroundingLinks
    ] = await Promise.all([
      Promise.all(recoveredOrganic.map(async (item) => ({ ...item, url: await resolveRedirectUrl(item.url) }))),
      Promise.all(validShoppingProducts.map(async (item) => ({ ...item, url: await resolveRedirectUrl(item.url) }))),
      Promise.all(recoveredAiSources.map(async (item) => ({ ...item, url: await resolveRedirectUrl(item.url) }))),
      Promise.all(recoveredGroundingLinks.map(async (item) => ({ ...item, url: await resolveRedirectUrl(item.url) })))
    ]);

    return {
      keyword,
      location: locationString,
      intent: { transactional, informational, explanation: intentExpl },
      aiOverview: { 
        present: aiPresent, 
        summary: aiSummary, 
        extract: aiExtract,
        sources: resolvedAiSources, 
        citationRecommendation: aiCitationRecommendation 
      },
      features,
      organicResults: resolvedOrganic,
      suggestions: { title: suggestedTitle, metaDescription: suggestedMeta, strategy: strategyBody },
      relatedKeywords: related,
      shoppingAnalysis: {
        present: shoppingPresent,
        products: resolvedShoppingProducts,
        insight: shoppingInsight
      },
      groundingLinks: resolvedGroundingLinks,
      rawText: fullReport || text
    };

    } catch (error) {
      console.error(`[DeepSERP] Attempt ${attempt}/${MAX_RETRIES} failed:`, error);
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }

  // All retries exhausted
  throw new Error("Ocurrió un error al analizar el SERP.");
};
