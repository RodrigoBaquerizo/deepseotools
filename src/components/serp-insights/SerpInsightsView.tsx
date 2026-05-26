import React, { useState, useEffect } from 'react';
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

export const SerpInsightsView: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<SearchState>({
    loading: false,
    error: null,
    result: null,
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Geolocation permission denied")
      );
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setState({ ...state, loading: true, error: null });
    try {
      const result = await analyzeSerp(keyword, location);
      setState({ loading: false, error: null, result });
    } catch (error: any) {
      setState({ loading: false, error: error.message, result: null });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Search Bar inside the content area */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
            <Target className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Deep SERP Insights</h1>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded w-max mt-1">v2.2</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
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

      {/* Main Content Area */}
      <div>
        {!state.result && !state.loading && !state.error && (
          <div className="text-center py-24 bg-white border border-dashed border-gray-200 rounded-[2.5rem] shadow-sm">
            <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <BarChart2 className="text-indigo-600 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Auditoría SEO de SERPs</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
              Analiza la competencia y la intención de búsqueda de cualquier palabra clave usando inteligencia artificial de última generación.
            </p>
          </div>
        )}

        {state.loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-gray-900">Rastreando el SERP...</h3>
              <p className="text-sm text-gray-500 font-medium animate-pulse italic">"Analizando la página 1 de resultados con Google Search Grounding..."</p>
            </div>
          </div>
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
            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <MetricCard title="Palabra Clave" value={state.result.keyword} icon={<BookOpen className="text-blue-600 w-5 h-5" />} color="blue" />
              <MetricCard title="Búsqueda Local" value={state.result.location.split(',')[0]} icon={<Globe className="text-emerald-600 w-5 h-5" />} color="emerald" />
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MousePointer2 className="text-indigo-600 w-5 h-5" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Intención de Búsqueda</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Probabilidad</span>
                </div>
                <div className="flex gap-2 h-4 mb-4 rounded-full overflow-hidden bg-gray-100">
                  <div className="bg-indigo-500 transition-all duration-1000" style={{ width: `${state.result.intent.transactional}%` }}></div>
                  <div className="bg-sky-400 transition-all duration-1000" style={{ width: `${state.result.intent.informational}%` }}></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold mb-3">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Transaccional ({state.result.intent.transactional}%)</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-400"></div> Informacional ({state.result.intent.informational}%)</div>
                </div>
                <p className="text-xs text-gray-500 italic leading-relaxed line-clamp-2">{state.result.intent.explanation}</p>
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
                     <p className="text-xs text-gray-600 leading-relaxed bg-amber-50/50 p-5 rounded-2xl">
                       {state.result.suggestions.strategy}
                     </p>
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
                      <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {state.result.organicResults.map((res, i) => (
                      <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <span className="text-2xl font-black text-gray-200 group-hover:text-indigo-200 transition-colors">{i + 1}</span>
                        </td>
                        <td className="px-8 py-6">
                          <h4 className="font-bold text-indigo-600 text-base mb-1 group-hover:underline cursor-pointer">{res.title}</h4>
                          <p className="text-emerald-700 text-xs mb-2 truncate max-w-lg">{res.url}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 max-w-2xl">{res.description}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
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
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
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
                  <ChevronRight className="w-5 h-5 text-gray-400" />
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

            {/* Full Report Narrative */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <button 
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const el = document.getElementById('full-report');
                  el?.classList.toggle('hidden');
                }}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  <span className="font-bold text-gray-900 uppercase text-xs tracking-widest">Análisis Narrativo Completo</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <div id="full-report" className="hidden px-8 pb-12 pt-4 border-t border-gray-50">
                 <div className="prose prose-indigo max-w-none whitespace-pre-wrap text-gray-600 text-sm leading-relaxed">
                   {state.result.rawText}
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color }: { title: string; value: string; icon: any; color: string }) => {
  const bgColors: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-xl ${bgColors[color] || 'bg-gray-50'}`}>
          {icon}
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</span>
      </div>
      <p className="text-lg font-extrabold text-gray-900 truncate">{value}</p>
    </div>
  );
};
