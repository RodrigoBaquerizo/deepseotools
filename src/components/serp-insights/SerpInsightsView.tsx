import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExportButton } from '../shared/ExportButton';
import { 
  Search, Loader2, Globe, BarChart2, BookOpen, Sparkles, 
  Layout, Link as LinkIcon, Info, Target, MousePointer2, 
  CheckCircle2, ExternalLink, Hash, Lightbulb, Map, MessageSquare, 
  Video, Image as ImageIcon, HelpCircle, ChevronRight, Quote, Award,
  ShoppingBag, Tag
} from 'lucide-react';
import { analyzeSerp } from '../../services/serpService';
import { SearchState, SerpFeature, OrganicResult } from '../../types';

const FeatureIcon = ({ name }: { name: string }) => {
  const n = name.toLowerCase();
  if (n.includes('map') || n.includes('local')) return <Map className="w-5 h-5" />;
  if (n.includes('video')) return <Video className="w-5 h-5" />;
  if (n.includes('image') || n.includes('imagen')) return <ImageIcon className="w-5 h-5" />;
  if (n.includes('preguntas') || n.includes('paa')) return <HelpCircle className="w-5 h-5" />;
  if (n.includes('noticias')) return <Layout className="w-5 h-5" />;
  return <Sparkles className="w-5 h-5" />;
};

const GEO_PRESETS = {
  global: { label: 'Global (Sin geolocalizar)', coords: undefined },
  spain: { label: 'España (Madrid)', coords: { lat: 40.416775, lng: -3.703790 } },
  mexico: { label: 'México (CDMX)', coords: { lat: 19.432608, lng: -99.133209 } },
  usa: { label: 'EE.UU. (New York)', coords: { lat: 40.712776, lng: -74.005974 } },
  argentina: { label: 'Argentina (Buenos Aires)', coords: { lat: -34.603722, lng: -58.381592 } },
  colombia: { label: 'Colombia (Bogotá)', coords: { lat: 4.710989, lng: -74.072092 } },
};

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

const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`, {
      headers: {
        'User-Agent': 'DeepSEOTools/1.0'
      }
    });
    if (res.ok) {
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || data.address?.county;
      const country = data.address?.country;
      if (city && country) {
        return `${city}, ${country} (GPS)`;
      } else if (city) {
        return `${city} (GPS)`;
      }
    }
  } catch (e) {
    console.error("Geocoding error:", e);
  }
  return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
};

const QUICK_EXAMPLES = [
  { label: '👟 Zapatillas Nike', query: 'zapatillas Nike' },
  { label: '📍 Psicólogo Madrid', query: 'psicólogo madrid' },
  { label: '🎓 Cómo aprender SEO', query: 'cómo aprender seo' },
  { label: '🍳 Receta de tortilla de patatas', query: 'receta de tortilla de patatas' }
];

export const SerpInsightsView: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<SearchState>({
    loading: false,
    error: null,
    result: null,
  });
  const [geoMode, setGeoMode] = useState<string>('spain');
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>(GEO_PRESETS.spain.coords);
  const [showGeoSettings, setShowGeoSettings] = useState<boolean>(false);
  const [resolvedGpsLabel, setResolvedGpsLabel] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState('Iniciando rastreador del SERP...');

  useEffect(() => {
    if (!state.loading) {
      setLoadingMessage('Iniciando rastreador del SERP...');
      return;
    }

    const messages = [
      'Iniciando rastreador del SERP...',
      'Conectando con Google Search Grounding...',
      'Analizando la intención de búsqueda (Info, Navegacional, Comercial, Transaccional)...',
      'Extrayendo características especiales de la SERP...',
      'Verificando presencia de Google AI Overviews...',
      'Buscando resultados locales y geolocalización...',
      'Estructurando insights estratégicos de competidores...',
      'Generando propuestas de Meta Title y Description optimizados...',
      'Finalizando análisis táctico completo...'
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % messages.length;
      setLoadingMessage(messages[currentIdx]);
    }, 2500);

    return () => clearInterval(interval);
  }, [state.loading]);

  const handleGeoSelect = (mode: string) => {
    if (mode === 'gps') {
      if (navigator.geolocation) {
        setGeoMode('gps');
        setResolvedGpsLabel('Buscando ubicación...');
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setLocation(coords);
            setResolvedGpsLabel(`GPS (${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)})`);
            try {
              const label = await reverseGeocode(coords.lat, coords.lng);
              setResolvedGpsLabel(label);
            } catch (e) {
              console.error(e);
            }
          },
          (err) => {
            console.error("GPS error:", err);
            alert("No se pudo obtener la geolocalización. Usando ubicación global.");
            setGeoMode('global');
            setLocation(undefined);
            setResolvedGpsLabel('');
          }
        );
      } else {
        alert("Geolocalización no soportada por el navegador.");
      }
    } else {
      setGeoMode(mode);
      const preset = GEO_PRESETS[mode as keyof typeof GEO_PRESETS];
      setLocation(preset ? preset.coords : undefined);
      setResolvedGpsLabel('');
    }
  };

  const performSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      let label = 'Global';
      if (geoMode === 'gps') {
        label = resolvedGpsLabel || (location ? `GPS (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'GPS');
      } else {
        const preset = GEO_PRESETS[geoMode as keyof typeof GEO_PRESETS];
        label = preset ? preset.label : 'Global';
      }
      const result = await analyzeSerp(queryToSearch, location, label);
      setState({ loading: false, error: null, result });
    } catch (error: any) {
      setState({ loading: false, error: error.message, result: null });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(keyword);
  };

  const handleExampleClick = (query: string) => {
    setKeyword(query);
    performSearch(query);
  };

  return (
    <div className="space-y-8">
      {/* Header & Search Bar inside the content area */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <Target className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Deep SERP Insights</h1>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded w-max mt-1">v2.2</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl w-full">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Analizar palabra clave (ej. 'psicólogos en madrid')"
              className="w-full pl-11 pr-28 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-gray-800 font-medium text-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              type="submit"
              disabled={state.loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              {state.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analizar'}
            </button>
          </form>
        </div>

        {/* Collapsible Geo Settings Trigger */}
        <div className="flex justify-end pt-2 border-t border-gray-50">
          <button
            type="button"
            onClick={() => setShowGeoSettings(!showGeoSettings)}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Configuración Geográfica: <span className="underline">{geoMode === 'gps' ? (resolvedGpsLabel || 'Buscando ubicación...') : (GEO_PRESETS[geoMode as keyof typeof GEO_PRESETS]?.label || 'Global')}</span></span>
          </button>
        </div>

        {/* Geo Settings Panel */}
        {showGeoSettings && (
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 animate-in slide-in-from-top-2 duration-200">
            {Object.entries(GEO_PRESETS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleGeoSelect(key)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                  geoMode === key
                    ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm shadow-indigo-100'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-white hover:border-gray-300'
                }`}
              >
                <span className="truncate max-w-full">{key === 'global' ? 'Global' : item.label.split(' ')[0]}</span>
                <span className="text-[10px] text-gray-400 font-medium truncate max-w-full">
                  {key === 'global' ? 'Sin GPS' : item.label.substring(item.label.indexOf('('))}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleGeoSelect('gps')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                geoMode === 'gps'
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm shadow-emerald-100'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-white hover:border-gray-300'
              }`}
            >
              <span>Ubicación GPS</span>
              <span className="text-[10px] text-gray-400 font-medium">Actual (Navegador)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div>
        {!state.result && !state.loading && !state.error && (
          <div className="text-center py-16 md:py-24 bg-white border border-dashed border-gray-200 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center">
            <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-inner">
              <BarChart2 className="text-indigo-600 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Auditoría SEO de SERPs</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed mb-8 px-6">
              Analiza la competencia y la intención de búsqueda de cualquier palabra clave.
            </p>
            <div className="max-w-2xl mx-auto space-y-4 px-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ejemplos de inicio rápido</h3>
              <div className="flex flex-wrap justify-center gap-2.5">
                {QUICK_EXAMPLES.map((example) => (
                  <button
                    key={example.query}
                    onClick={() => handleExampleClick(example.query)}
                    className="px-4 py-2 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white border border-indigo-100/50 rounded-xl text-xs font-bold text-indigo-700 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md hover:border-indigo-600 cursor-pointer flex items-center"
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {state.loading && (
          <SerpInsightsSkeleton message={loadingMessage} />
        )}

        {state.error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 px-6 py-4 rounded-xl flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-rose-100 p-2 rounded-lg"><Info className="w-5 h-5 text-rose-600" /></div>
              <p className="font-semibold text-sm">{state.error}</p>
            </div>
          </div>
        )}

        {state.result && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
            {/* Action Bar (Screen Only) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm print:hidden">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resultado del Análisis</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-extrabold text-gray-900">"{keyword}"</span>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    {geoMode === 'gps' ? resolvedGpsLabel : (GEO_PRESETS[geoMode as keyof typeof GEO_PRESETS]?.label || 'Global')}
                  </span>
                </div>
              </div>
              <ExportButton onExportPdf={() => window.print()} />
            </div>

            {/* Print-Only Executive Header */}
            <div className="hidden print:flex flex-col border-b-2 border-indigo-600 pb-6 mb-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm tracking-tight text-indigo-900 uppercase">Deep SEO Suite</span>
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Workspace</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <div>Fecha: {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div>Ubicación: {geoMode === 'gps' ? resolvedGpsLabel : (GEO_PRESETS[geoMode as keyof typeof GEO_PRESETS]?.label || 'Global')}</div>
                </div>
              </div>
              <div className="mt-6">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Reporte de Análisis SERP: {keyword}</h1>
                <p className="text-xs text-gray-500 mt-1">Informe estratégico consolidado e insights del motor de búsqueda.</p>
              </div>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <MetricCard 
                title="Búsqueda Local" 
                value={state.result.location} 
                icon={<Globe className="text-emerald-600 w-5 h-5" />} 
                color="emerald" 
              />
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 col-span-1 lg:col-span-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MousePointer2 className="text-indigo-600 w-5 h-5" />
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Intención de Búsqueda</span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Probabilidad</span>
                  </div>

                  {/* Barra de progreso multi-segmento premium con degradados y separadores */}
                  <div className="flex gap-[2px] h-5 mb-4 rounded-full overflow-hidden bg-gray-100 shadow-inner border border-gray-50/50">
                    {state.result.intent.informational > 0 && (
                      <div 
                        className="h-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-1000 relative group" 
                        style={{ width: `${state.result.intent.informational}%` }}
                        title={`Informacional: ${state.result.intent.informational}%`}
                      />
                    )}
                    {state.result.intent.navigational > 0 && (
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000 relative group" 
                        style={{ width: `${state.result.intent.navigational}%` }}
                        title={`Navegacional: ${state.result.intent.navigational}%`}
                      />
                    )}
                    {state.result.intent.commercial > 0 && (
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000 relative group" 
                        style={{ width: `${state.result.intent.commercial}%` }}
                        title={`Comercial: ${state.result.intent.commercial}%`}
                      />
                    )}
                    {state.result.intent.transactional > 0 && (
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 relative group" 
                        style={{ width: `${state.result.intent.transactional}%` }}
                        title={`Transaccional: ${state.result.intent.transactional}%`}
                      />
                    )}
                  </div>

                  {/* Cuadrícula detallada con badges estilizados e iconos */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {/* Info */}
                    <div className="flex flex-col items-center justify-between p-3 rounded-2xl bg-sky-50/20 border border-sky-100/50 hover:bg-sky-50/50 hover:border-sky-200 transition-all duration-300 text-center group/chip">
                      <div className="flex items-center gap-1.5 text-sky-600 mb-1">
                        <BookOpen className="w-3.5 h-3.5 group-hover/chip:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Info</span>
                      </div>
                      <span className="text-sm font-extrabold text-sky-900">{state.result.intent.informational}%</span>
                    </div>

                    {/* Navegacional */}
                    <div className="flex flex-col items-center justify-between p-3 rounded-2xl bg-amber-50/20 border border-amber-100/50 hover:bg-amber-50/50 hover:border-amber-200 transition-all duration-300 text-center group/chip">
                      <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                        <Globe className="w-3.5 h-3.5 group-hover/chip:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Naveg</span>
                      </div>
                      <span className="text-sm font-extrabold text-amber-900">{state.result.intent.navigational}%</span>
                    </div>

                    {/* Comercial */}
                    <div className="flex flex-col items-center justify-between p-3 rounded-2xl bg-violet-50/20 border border-violet-100/50 hover:bg-violet-50/50 hover:border-violet-200 transition-all duration-300 text-center group/chip">
                      <div className="flex items-center gap-1.5 text-violet-600 mb-1">
                        <BarChart2 className="w-3.5 h-3.5 group-hover/chip:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Comer</span>
                      </div>
                      <span className="text-sm font-extrabold text-violet-900">{state.result.intent.commercial}%</span>
                    </div>

                    {/* Transaccional */}
                    <div className="flex flex-col items-center justify-between p-3 rounded-2xl bg-emerald-50/20 border border-emerald-100/50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all duration-300 text-center group/chip">
                      <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                        <ShoppingBag className="w-3.5 h-3.5 group-hover/chip:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Transac</span>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-900">{state.result.intent.transactional}%</span>
                    </div>
                  </div>
                </div>

                {/* Burbuja de Insight de IA */}
                <div className="mt-2 pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-2.5 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-3">
                    <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">Resumen de Intención</h4>
                      <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                        {state.result.intent.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Report Narrative */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <button 
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors print:bg-transparent print:border-b print:border-gray-100 print:py-4 print:px-0"
                onClick={() => {
                  const el = document.getElementById('full-report');
                  el?.classList.toggle('hidden');
                }}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  <span className="font-bold text-gray-900 uppercase text-xs tracking-widest">Análisis Narrativo Completo</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 print:hidden" />
              </button>
              <div id="full-report" className="hidden px-8 pb-12 pt-4 border-t border-gray-50">
                 <div className="prose prose-indigo max-w-none text-gray-600 text-sm leading-relaxed">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.result.rawText}</ReactMarkdown>
                 </div>
              </div>
            </div>

            {/* AI Overview Spotlight */}
            {state.result.aiOverview.present && (
              <div className="bg-white rounded-[2rem] border-2 border-indigo-100 p-8 shadow-xl shadow-indigo-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><Sparkles className="w-32 h-32 text-indigo-600" /></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200">
                      <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900">Google AI Overview (SGE) Detectado</h3>
                      <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider">Análisis Generativo</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="text-gray-700 text-base leading-relaxed bg-indigo-50/30 p-6 rounded-2xl border border-indigo-50 relative">
                        <Quote className="absolute -top-3 -left-3 text-indigo-200 w-10 h-10 -z-10" />
                        <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Resumen de la IA</h4>
                        {state.result.aiOverview.summary}
                      </div>

                      {state.result.aiOverview.extract && (
                        <div className="bg-white border-l-4 border-purple-400 p-6 rounded-r-2xl shadow-sm">
                          <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Fragmento Textual Detectado
                          </h4>
                          <p className="text-gray-600 italic text-sm leading-relaxed">
                            "{state.result.aiOverview.extract}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" /> Fuentes Citadas
                      </h4>
                      <div className="space-y-2">
                        {state.result.aiOverview.sources.map((source, i) => (
                          <a key={i} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-300 transition-all group">
                            <span className="text-xs font-bold text-gray-700 truncate mr-2">{source.title}</span>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation to be cited */}
                  {state.result.aiOverview.citationRecommendation && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-3 text-purple-700">
                        <Award className="w-6 h-6" />
                        <h4 className="font-extrabold text-xs uppercase tracking-widest">Recomendación para ser citado en AI Overview</h4>
                      </div>
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">
                        {state.result.aiOverview.citationRecommendation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Organic Shopping Analysis */}
            {state.result.shoppingAnalysis?.present && (
              <div className="bg-white rounded-[2rem] border border-emerald-100 p-8 shadow-xl shadow-emerald-50 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-100">
                    <ShoppingBag className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900">Organic Shopping Analysis</h3>
                    <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Resultados de Producto Detectados</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-100/50 border-b border-gray-200">
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Producto</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Precio</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Web</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {state.result.shoppingAnalysis.products.map((product, i) => (
                            <tr key={i} className="hover:bg-white transition-colors">
                              <td className="px-6 py-4">
                                <span className="font-bold text-gray-800 text-sm">{product.title}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                                  <Tag className="w-3 h-3" /> {product.price}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <a href={product.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50/50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                                  {product.website}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 h-fit">
                    <div className="flex items-center gap-2 mb-4 text-emerald-800">
                      <Sparkles className="w-5 h-5" />
                      <h4 className="font-extrabold text-xs uppercase tracking-widest">Shopping Insights</h4>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed italic">
                      {state.result.shoppingAnalysis.insight}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Features & Strategy */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Features List */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <Layout className="text-gray-900 w-5 h-5" />
                    <h3 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">SERP Features Detectadas</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {state.result.features.map((feature, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 font-bold text-indigo-700">
                          <FeatureIcon name={feature.name} />
                          <span className="text-xs">{feature.name}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight">{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related Keywords */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                    <Hash className="text-gray-900 w-5 h-5" />
                    <h3 className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">Búsquedas Relacionadas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.result.relatedKeywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-colors cursor-default">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions Strategy */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-8">
                  <Lightbulb className="text-amber-500 w-6 h-6" />
                  <h3 className="text-xl font-extrabold text-gray-900">Estrategia SEO Sugerida</h3>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Meta Title Optimizado</label>
                    <div className="p-4 bg-gray-50 border-l-4 border-indigo-500 rounded-r-xl font-bold text-base text-gray-800">
                      {state.result.suggestions.title || "Cargando..."}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Meta Description Sugerida</label>
                    <div className="p-4 bg-gray-50 border-l-4 border-emerald-500 rounded-r-xl text-gray-600 text-xs leading-relaxed">
                      {state.result.suggestions.metaDescription || "Cargando..."}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                     <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2 italic">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Guía Táctica:
                     </h4>
                     <div className="text-xs text-gray-600 leading-relaxed bg-amber-50/50 p-5 rounded-2xl prose prose-amber max-w-none">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.result.suggestions.strategy}</ReactMarkdown>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organic Results Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-gray-900 text-white px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layout className="w-6 h-6 text-indigo-400" />
                  <h3 className="text-lg font-bold">Resultados Orgánicos Principales</h3>
                </div>
                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-indigo-300 uppercase">Top 10 Análisis</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50">
                    <tr className="border-b border-gray-100">
                      <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Posición</th>
                      <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contenido del Resultado</th>
                      <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right print:hidden">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {state.result.organicResults.map((res, i) => (
                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors group print-avoid-break">
                        <td className="px-8 py-6">
                          <span className="text-2xl font-black text-gray-200 group-hover:text-indigo-200 transition-colors">{i + 1}</span>
                        </td>
                        <td className="px-8 py-6">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="inline-block group/link">
                            <h4 className="font-bold text-indigo-600 text-base mb-1 group-hover/link:underline">{res.title}</h4>
                          </a>
                          <div className="flex items-center gap-1.5 mb-2">
                            {(() => {
                              try {
                                const domain = getDisplayDomain(res.url, res.title);
                                return (
                                  <img 
                                    src={`https://www.google.com/s2/favicons?sz=32&domain=${domain}`} 
                                    alt="" 
                                    className="w-4 h-4 rounded flex-shrink-0 bg-gray-50"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%2310B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`;
                                    }}
                                  />
                                );
                              } catch {
                                return null;
                              }
                            })()}
                            <span className="text-emerald-700 text-xs truncate max-w-lg font-medium">{getDisplayDomain(res.url, res.title)}</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 max-w-2xl">{res.description}</p>
                        </td>
                        <td className="px-8 py-6 text-right print:hidden">
                          <a href={res.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grounding Sources */}
            {state.result.groundingLinks.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <button
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors print:bg-transparent print:border-b print:border-gray-100 print:py-4 print:px-0"
                  onClick={() => {
                    const el = document.getElementById('grounding-sources');
                    el?.classList.toggle('hidden');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-5 h-5 text-indigo-500" />
                    <span className="font-bold text-gray-900 uppercase text-xs tracking-widest">Fuentes verificadas del análisis</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full border border-indigo-100">{state.result.groundingLinks.length} fuentes</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 print:hidden" />
                </button>
                <div id="grounding-sources" className="hidden px-8 pb-8 pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-400 mb-4 italic">Páginas web reales consultadas por Gemini vía Google Search para generar este análisis.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {state.result.groundingLinks.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                        <span className="text-xs font-medium text-gray-700 truncate mr-2 group-hover:text-indigo-700">{link.title}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}


          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color, children }: { title: string; value: string; icon: any; color: string; children?: React.ReactNode }) => {
  const bgColors: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[140px]">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-xl ${bgColors[color] || 'bg-gray-50'}`}>
            {icon}
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</span>
        </div>
        <p className="text-lg font-extrabold text-gray-900 truncate">{value}</p>
      </div>
      {children && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

const SerpInsightsSkeleton = ({ message }: { message: string }) => {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Dynamic phase loading indicator */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Sparkles className="absolute text-indigo-400 w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-gray-900">Procesando consulta...</h3>
          <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider animate-pulse">{message}</p>
        </div>
      </div>

      {/* Top Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Búsqueda Local Skeleton */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 min-h-[140px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gray-200"></div>
              </div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded mt-3"></div>
        </div>

        {/* Intención de Búsqueda Skeleton */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm col-span-1 lg:col-span-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-100 rounded-lg"></div>
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-16 bg-gray-100 rounded-full"></div>
            </div>

            {/* Multi-segment progress bar skeleton */}
            <div className="h-5 mb-4 rounded-full bg-gray-100 w-full animate-pulse"></div>

            {/* Cuadrícula detallada con 4 chips skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                  <div className="h-2.5 w-10 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Burbuja de Insight de IA Skeleton */}
          <div className="mt-2 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2.5 bg-gray-50/50 border border-gray-100 rounded-2xl p-3">
              <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0 mt-0.5 animate-pulse"></div>
              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-28 bg-gray-300 rounded"></div>
                <div className="h-2.5 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Analysis Accordion Skeleton */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="h-3 w-48 bg-gray-200 rounded"></div>
          </div>
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Features & Strategy Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
          <div className="h-3 w-36 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-2 w-full bg-gray-200 rounded"></div>
                <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-8 space-y-6">
          <div className="h-4 w-44 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-2.5 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-50 border-l-4 border-gray-200 rounded-r-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organic Results Table Skeleton */}
      <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-700 rounded"></div>
            <div className="h-4 w-52 bg-gray-700 rounded"></div>
          </div>
          <div className="h-5 w-24 bg-gray-700 rounded-full"></div>
        </div>
        <div className="p-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-6 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                <div className="h-2.5 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-3 w-full bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
