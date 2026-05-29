// src/components/seo-benchmark/HeadingOutline.tsx
import React, { useState } from 'react';
import { WebsiteAnalysis } from '../../types';
import { ChevronDown, ChevronRight, Eye, EyeOff, LayoutGrid } from 'lucide-react';

interface HeadingOutlineProps {
  userSite: WebsiteAnalysis;
  competitors: WebsiteAnalysis[];
}

interface SiteOutlineCardProps {
  siteName: string;
  label: string;
  isUser: boolean;
  h1: string;
  h2s: string[];
  h3s: string[];
  initiallyExpanded: boolean;
}

const SiteOutlineCard: React.FC<SiteOutlineCardProps> = ({
  siteName,
  label,
  isUser,
  h1,
  h2s,
  h3s,
  initiallyExpanded,
}) => {
  const [h2Expanded, setH2Expanded] = useState(initiallyExpanded);
  const [h3Expanded, setH3Expanded] = useState(initiallyExpanded);

  // Sync state if global expand/collapse triggers changes
  React.useEffect(() => {
    setH2Expanded(initiallyExpanded);
    setH3Expanded(initiallyExpanded);
  }, [initiallyExpanded]);

  const cleanDomain = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];

  return (
    <div className={`rounded-2xl border p-5 flex flex-col space-y-4 transition-all duration-200 ${
      isUser 
        ? 'bg-indigo-50/30 border-indigo-200 shadow-sm' 
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex flex-col border-b border-gray-100 pb-3">
        <span className="text-gray-900 font-bold text-xs truncate" title={siteName}>
          {cleanDomain(siteName)}
        </span>
        <span className={`text-[9px] font-extrabold uppercase tracking-widest mt-0.5 ${
          isUser ? 'text-indigo-600' : 'text-gray-400'
        }`}>
          {label}
        </span>
      </div>

      {/* Tree Node Structure */}
      <div className="flex-1 space-y-3 font-sans text-xs">
        
        {/* H1 Node */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded bg-indigo-600 text-white font-black text-[9px] tracking-tight mt-0.5">
              H1
            </span>
            {h1 ? (
              <span className="text-gray-900 font-semibold leading-relaxed">
                {h1}
              </span>
            ) : (
              <span className="text-rose-600 font-bold italic">
                Sin encabezado principal H1
              </span>
            )}
          </div>
        </div>

        {/* H2 Node */}
        <div className="border-l border-dashed border-gray-200 pl-4 space-y-1">
          <button
            onClick={() => setH2Expanded(!h2Expanded)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 font-bold tracking-tight text-[10px] uppercase w-full text-left"
          >
            {h2Expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>H2 Subencabezados</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
              h2s.length > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-400'
            }`}>
              {h2s.length}
            </span>
          </button>

          {h2Expanded && (
            <div className="pt-1.5 pb-1 pl-1 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
              {h2s.length > 0 ? (
                h2s.map((h2, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-700 leading-relaxed">
                    <span className="flex-shrink-0 text-gray-300 font-bold select-none">•</span>
                    <span className="break-words">{h2}</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 italic text-[11px] pl-4">No se detectaron H2s</span>
              )}
            </div>
          )}
        </div>

        {/* H3 Node */}
        <div className="border-l border-dashed border-gray-200 pl-4 space-y-1">
          <button
            onClick={() => setH3Expanded(!h3Expanded)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 font-bold tracking-tight text-[10px] uppercase w-full text-left"
          >
            {h3Expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span>H3 Secciones</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
              h3s.length > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-400'
            }`}>
              {h3s.length}
            </span>
          </button>

          {h3Expanded && (
            <div className="pt-1.5 pb-1 pl-1 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
              {h3s.length > 0 ? (
                h3s.map((h3, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-gray-600 leading-relaxed">
                    <span className="flex-shrink-0 text-gray-300 font-bold select-none">•</span>
                    <span className="break-words">{h3}</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 italic text-[11px] pl-4">No se detectaron H3s</span>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export const HeadingOutline: React.FC<HeadingOutlineProps> = ({ userSite, competitors }) => {
  const [globalExpanded, setGlobalExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Title & Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900">
            Estructura Jerárquica de Encabezados (Heading Outline)
          </h3>
        </div>
        <button
          onClick={() => setGlobalExpanded(!globalExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/70 rounded-xl transition-all active:scale-95 self-start sm:self-auto"
        >
          {globalExpanded ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Colapsar Todo</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Expandir Todo</span>
            </>
          )}
        </button>
      </div>

      {/* Responsive Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* User site outline */}
        <SiteOutlineCard
          siteName={userSite.url}
          label="Mi Web"
          isUser={true}
          h1={userSite.h1}
          h2s={userSite.h2s}
          h3s={userSite.h3s}
          initiallyExpanded={globalExpanded}
        />

        {/* Competitors outlines */}
        {competitors.map((c, i) => (
          <SiteOutlineCard
            key={i}
            siteName={c.url}
            label={`Competidor ${i + 1}`}
            isUser={false}
            h1={c.h1}
            h2s={c.h2s}
            h3s={c.h3s}
            initiallyExpanded={globalExpanded}
          />
        ))}
      </div>

      {/* Outline Compare tips */}
      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] text-gray-500 leading-relaxed">
        <p className="font-semibold flex items-center gap-1 mb-1 text-gray-700">
          🔍 Diagnóstico de Arquitectura Semántica:
        </p>
        <p>
          Una jerarquía correcta ayuda a Google a comprender la relevancia de tus temas. Asegúrate de tener exactamente un solo <strong>H1</strong> principal en cada página y estructura las secciones lógicas con encabezados <strong>H2</strong> y subtemas en <strong>H3</strong>. Compara el nivel de detalle y cantidad de temas cubiertos por tus competidores para encontrar oportunidades de estructuración de contenido.
        </p>
      </div>
    </div>
  );
};
