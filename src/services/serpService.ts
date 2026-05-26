
import { GoogleGenAI } from "@google/genai";
import { SerpAnalysisResult } from "../types";

const MODEL_NAME = 'gemini-2.5-flash';

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
    Present: [Yes/No]
    Product: [Título] | [Precio] | [URL] | [Nombre de la Web]
    Product: [Título] | [Precio] | [URL] | [Nombre de la Web]
    ...
    Insight: [Breve análisis estratégico en castellano de los productos encontrados]

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
      const [title, url, description] = o.split('|').map(p => p.trim());
      return { title, url, description };
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

    const shoppingPresent = shoppingSection.match(/Present:\s*Yes/i) !== null;
    const shoppingProducts = parseList(shoppingSection, "Product:").map(p => {
      const [title, price, url, website] = p.split('|').map(part => part.trim());
      return { title, price, url, website: website || "Ver Web" };
    });
    const shoppingInsight = shoppingSection.match(/Insight:\s*(.*)/i)?.[1] || "";

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingLinks = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Enlace de búsqueda",
        url: chunk.web?.uri || "#"
      }));

    return {
      keyword,
      location: locationString,
      intent: { transactional, informational, explanation: intentExpl },
      aiOverview: { 
        present: aiPresent, 
        summary: aiSummary, 
        extract: aiExtract,
        sources: aiSources, 
        citationRecommendation: aiCitationRecommendation 
      },
      features,
      organicResults: organic,
      suggestions: { title: suggestedTitle, metaDescription: suggestedMeta, strategy: strategyBody },
      relatedKeywords: related,
      shoppingAnalysis: {
        present: shoppingPresent,
        products: shoppingProducts,
        insight: shoppingInsight
      },
      groundingLinks,
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
