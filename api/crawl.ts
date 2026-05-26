// api/crawl.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Security check: Only allow localhost (dev) or vercel.app domains (prod) to prevent external abuse
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';
  const isLocal = origin.startsWith('http://localhost') || 
                  referer.startsWith('http://localhost') || 
                  origin.startsWith('http://127.0.0.1') || 
                  referer.startsWith('http://127.0.0.1');
  const isOurApp = origin.endsWith('.vercel.app') || referer.includes('.vercel.app');

  if (!isLocal && !isOurApp) {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }

  const { url } = req.body as { url?: string };
  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'URL requerida' });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: `URL inválida: ${url}` });
  }

  try {
    // Dynamic import to handle CommonJS vs ESM compatibility in Node.js/Vercel
    const crawlerModule = await import('../backend/crawler.js') as any;
    const crawlUrl = crawlerModule.crawlUrl || crawlerModule.default?.crawlUrl;

    if (typeof crawlUrl !== 'function') {
      throw new Error('No se pudo encontrar la función crawlUrl en el módulo del crawler');
    }

    const seoData = await crawlUrl(url.trim());
    return res.status(200).json(seoData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado al rastrear la URL';
    console.error('[serverless] Error crawling URL:', message);
    return res.status(500).json({ error: message });
  }
}
