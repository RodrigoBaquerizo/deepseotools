// src/components/seo-benchmark/SchemaMarkupComparison.tsx
import React from 'react';
import { Check, X, AlertTriangle, HelpCircle } from 'lucide-react';

interface SchemaMarkupComparisonProps {
  userSiteUrl: string;
  userStructuredData: string[];
  competitors: Array<{
    url: string;
    structuredData: string[];
  }>;
}

export const SchemaMarkupComparison: React.FC<SchemaMarkupComparisonProps> = ({
  userSiteUrl,
  userStructuredData,
  competitors,
}) => {
  const cleanDomain = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];

  // 1. Gather all unique schema types across all sites (deduplicated)
  const allSchemaTypes = Array.from(
    new Set([
      ...userStructuredData,
      ...competitors.flatMap(c => c.structuredData),
    ])
  ).sort();

  if (allSchemaTypes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-xs text-gray-500 shadow-sm">
        <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="font-semibold text-gray-700">Sin Datos Estructurados</p>
        <p className="mt-1">No se detectaron marcas de Schema.org (JSON-LD) en ninguna de las páginas comparadas.</p>
      </div>
    );
  }

  // 2. Helper to check if user has a gap for a specific schema type
  // (A gap is when the user lacks a schema but at least one competitor has it)
  const isGap = (type: string) => {
    const userHasIt = userStructuredData.includes(type);
    if (userHasIt) return false;
    return competitors.some(c => c.structuredData.includes(type));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all duration-200">
      
      {/* Title Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Matriz de Cobertura de Datos Estructurados (Schema.org)
        </h3>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-white border-b border-gray-100 font-semibold uppercase tracking-wider text-[10px] text-gray-500">
              <th className="px-6 py-3.5 font-bold text-gray-700">Tipo de Schema</th>
              <th className="px-6 py-3.5 min-w-[130px]">
                <div className="flex flex-col">
                  <span className="text-indigo-600 truncate max-w-[120px]" title={userSiteUrl}>
                    {cleanDomain(userSiteUrl)}
                  </span>
                  <span className="text-[9px] font-normal text-indigo-400">Mi Web</span>
                </div>
              </th>
              {competitors.map((c, idx) => (
                <th key={idx} className="px-6 py-3.5 min-w-[130px]">
                  <div className="flex flex-col">
                    <span className="text-gray-600 truncate max-w-[120px]" title={c.url}>
                      {cleanDomain(c.url)}
                    </span>
                    <span className="text-[9px] font-normal text-gray-400">Competidor {idx + 1}</span>
                  </div>
                </th>
              ))}
              <th className="px-6 py-3.5 text-right">Estado / Oportunidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allSchemaTypes.map((type, idx) => {
              const userHasIt = userStructuredData.includes(type);
              const isSchemaGap = isGap(type);

              return (
                <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                  {/* Schema Type Name */}
                  <td className="px-6 py-4 font-mono text-[11px] font-semibold text-gray-800">
                    {type}
                  </td>
                  
                  {/* User Site Status */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {userHasIt ? (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <Check className="w-4 h-4" />
                          <span className="text-[10px] font-bold">Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-300">
                          <X className="w-4 h-4" />
                          <span className="text-[10px] font-semibold">Ausente</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Competitors Status */}
                  {competitors.map((c, cIdx) => {
                    const compHasIt = c.structuredData.includes(type);
                    return (
                      <td key={cIdx} className="px-6 py-4">
                        <div className="flex items-center">
                          {compHasIt ? (
                            <div className="flex items-center gap-1 text-gray-700">
                              <Check className="w-4 h-4 text-emerald-500" />
                              <span className="text-[10px] font-medium">Activo</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-300">
                              <X className="w-4 h-4" />
                              <span className="text-[10px]">Ausente</span>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* GAP Status Column */}
                  <td className="px-6 py-4 text-right">
                    {isSchemaGap ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        Brecha Detectada
                      </span>
                    ) : userHasIt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Optimizado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium bg-gray-50 text-gray-400 border border-gray-100">
                        N/A
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Matrix Footnote */}
      <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 text-[10px] text-gray-500 flex items-start gap-1.5 leading-relaxed">
        <div className="mt-0.5">ℹ️</div>
        <div>
          Las marcas Schema.org ayudan a estructurar tu contenido para que Google genere **Rich Snippets** (resultados ricos con FAQ, precios, estrellas o recetas). Si se marca una **Brecha Detectada**, significa que tus competidores están aprovechando ese tipo de Schema pero tu web no lo tiene implementado. Te recomendamos añadirlo para competir en visibilidad en los resultados de búsqueda.
        </div>
      </div>

    </div>
  );
};
