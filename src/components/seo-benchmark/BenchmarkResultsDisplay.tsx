// components/BenchmarkResultsDisplay.tsx
import React from 'react';
import { WebsiteAnalysis } from '../../types';
import { HeadingOutline } from './HeadingOutline';
import { SchemaMarkupComparison } from './SchemaMarkupComparison';

interface BenchmarkResultsDisplayProps {
  userSite: WebsiteAnalysis;
  competitors: WebsiteAnalysis[];
}

// ── Metric comparison card ──────────────────────────────────────────────────

interface MetricCardProps {
  iconLabel: string;
  metricLabel: string;
  userValue: string | string[] | undefined;
  competitorValues: (string | string[] | undefined)[];
  isUrl?: boolean;
  userSiteUrl: string;
  competitorUrls: string[];
}

const getHealthBadge = (metricLabel: string, value: string | string[] | undefined) => {
  if (metricLabel === 'Título' || metricLabel === 'Title') {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) {
      return { label: 'Sin Título', color: 'bg-rose-50 text-rose-700 border-rose-100' };
    }
    const len = text.length;
    if (len >= 50 && len <= 60) {
      return { label: `${len} car. · Óptimo`, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    }
    if (len > 60 && len <= 70) {
      return { label: `${len} car. · Aceptable`, color: 'bg-amber-50 text-amber-700 border-amber-100' };
    }
    return { label: `${len} car. · Mejorable`, color: 'bg-rose-50 text-rose-700 border-rose-100' };
  }

  if (metricLabel === 'Meta Descripción') {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) {
      return { label: 'Sin Meta Desc.', color: 'bg-rose-50 text-rose-700 border-rose-100' };
    }
    const len = text.length;
    if (len >= 120 && len <= 160) {
      return { label: `${len} car. · Óptimo`, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    }
    if (len > 0 && len < 120) {
      return { label: `${len} car. · Corto`, color: 'bg-amber-50 text-amber-700 border-amber-100' };
    }
    return { label: `${len} car. · Largo`, color: 'bg-rose-50 text-rose-700 border-rose-100' };
  }

  if (metricLabel === 'Encabezado Principal' || metricLabel === 'H1') {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) {
      return { label: 'Sin H1', color: 'bg-rose-50 text-rose-700 border-rose-100' };
    }
    return { label: 'H1 Correcto', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  }

  return null;
};

const MetricComparisonCard: React.FC<MetricCardProps> = ({
  iconLabel,
  metricLabel,
  userValue,
  competitorValues,
  isUrl = false,
  userSiteUrl,
  competitorUrls,
}) => {
  const renderContent = (content: string | string[] | undefined) => {
    if (isUrl && typeof content === 'string') {
      return (
        <a
          href={content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 text-xs break-all hover:text-indigo-800 hover:underline transition-colors"
        >
          {content}
        </a>
      );
    } else if (Array.isArray(content)) {
      return content.length > 0 ? (
        <ul className="space-y-0.5">
          {content.map((item, idx) => (
            <li key={idx} className="text-xs text-text-primary flex items-start gap-1">
              <span className="mt-1 w-1 h-1 rounded-full bg-text-muted flex-shrink-0"></span>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-xs text-text-muted italic">N/A</span>
      );
    }
    return <p className="text-xs text-text-primary leading-relaxed">{content || <span className="italic text-text-muted">N/A</span>}</p>;
  };

  const formatUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  const userBadge = getHealthBadge(metricLabel, userValue);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 overflow-hidden">
      {/* Card label header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{iconLabel}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700">{metricLabel}</span>
      </div>

      {/* Columns: user + competitors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border-light border-t border-gray-100">
        {/* User site */}
        <div className="bg-indigo-50/50 border-l-4 border-indigo-600 px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-2 min-w-0">
            <div>
              <p className="text-indigo-600 text-[10px] font-bold truncate" title={userSiteUrl}>
                {formatUrl(userSiteUrl)}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">Mi Web</p>
            </div>
            {userBadge && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${userBadge.color} flex-shrink-0`}>
                {userBadge.label}
              </span>
            )}
          </div>
          {renderContent(userValue)}
        </div>

        {/* Competitors */}
        {competitorValues.map((val, idx) => {
          const compBadge = getHealthBadge(metricLabel, val);
          return (
            <div
              key={idx}
              className="bg-surface px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="mb-2 flex items-center justify-between gap-2 min-w-0">
                <div>
                  <p className="text-gray-600 text-[10px] font-bold truncate" title={competitorUrls[idx]}>
                    {formatUrl(competitorUrls[idx])}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    Competidor {idx + 1}
                  </p>
                </div>
                {compBadge && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${compBadge.color} flex-shrink-0`}>
                    {compBadge.label}
                  </span>
                )}
              </div>
              {renderContent(val)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Section title ───────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ title: string; icon?: string }> = ({ title, icon = '◆' }) => (
  <div className="flex items-center gap-2 mt-6 mb-3">
    <span className="text-indigo-600 text-xs">{icon}</span>
    <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{title}</h4>
  </div>
);


interface CrawlDiagnosticPanelProps {
  userSite: WebsiteAnalysis;
  competitors: WebsiteAnalysis[];
}

const CrawlDiagnosticPanel: React.FC<CrawlDiagnosticPanelProps> = ({ userSite, competitors }) => {
  const getMethodBadge = (method?: 'fetch' | 'playwright' | 'failed', error?: string) => {
    if (method === 'fetch') {
      return {
        label: 'Cheerio (HTML Estático)',
        tooltip: 'Rastreado con conexión HTTP directa de alta velocidad.',
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    }
    if (method === 'playwright') {
      return {
        label: 'Playwright (JS Rendered)',
        tooltip: 'Rastreado simulando un navegador real. Indica que el sitio depende de Javascript del cliente (Client-Side Rendering) o tiene protecciones avanzadas.',
        class: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dotClass: 'bg-indigo-500',
      };
    }
    return {
      label: error ? `Rastreo Fallido: ${error}` : 'Rastreo Fallido',
      tooltip: 'No se pudo obtener información del sitio. Verifica robots.txt o cortafuegos.',
      class: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
    };
  };

  const cleanDomain = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];

  const renderSiteRow = (site: WebsiteAnalysis, label: string, isUser: boolean) => {
    const badge = getMethodBadge(site.crawlMethod, site.crawlError);
    return (
      <div key={site.url} className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
        isUser ? 'bg-indigo-50/20 border-indigo-100' : 'bg-gray-50/50 border-gray-100'
      }`}>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-gray-900 truncate" title={site.url}>
            {cleanDomain(site.url)}
          </span>
          <span className={`text-[9px] font-extrabold uppercase tracking-widest mt-0.5 ${
            isUser ? 'text-indigo-600' : 'text-gray-400'
          }`}>
            {label}
          </span>
        </div>

        {/* Diagnostic Badge */}
        <div className="flex items-center gap-2">
          <span 
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.class}`}
            title={badge.tooltip}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass} animate-pulse`} />
            {badge.label}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-3.5">
      <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Diagnóstico de Rastreo (Crawl Diagnostics)
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {renderSiteRow(userSite, 'Mi Web', true)}
        {competitors.map((c, i) => renderSiteRow(c, `Competidor ${i + 1}`, false))}
      </div>
    </div>
  );
};

// ── Main export ─────────────────────────────────────────────────────────────

const BenchmarkResultsDisplay: React.FC<BenchmarkResultsDisplayProps> = ({ userSite, competitors }) => {
  const competitorUrls = competitors.map(c => c.url);

  return (
    <div className="space-y-6">

      {/* Crawl diagnostic header */}
      <CrawlDiagnosticPanel userSite={userSite} competitors={competitors} />

      {/* ── SEO Elements section ── */}
      <SectionTitle title="Elementos SEO — Home / Subdirectorio" />

      <MetricComparisonCard
        iconLabel="📝"
        metricLabel="Título"
        userValue={userSite.title}
        competitorValues={competitors.map(c => c.title)}
        userSiteUrl={userSite.url}
        competitorUrls={competitorUrls}
      />
      <MetricComparisonCard
        iconLabel="🔍"
        metricLabel="Meta Descripción"
        userValue={userSite.metaDescription}
        competitorValues={competitors.map(c => c.metaDescription)}
        userSiteUrl={userSite.url}
        competitorUrls={competitorUrls}
      />
      <MetricComparisonCard
        iconLabel="H1"
        metricLabel="Encabezado Principal"
        userValue={userSite.h1}
        competitorValues={competitors.map(c => c.h1)}
        userSiteUrl={userSite.url}
        competitorUrls={competitorUrls}
      />
      <MetricComparisonCard
        iconLabel="H2"
        metricLabel="Subencabezados"
        userValue={userSite.h2s}
        competitorValues={competitors.map(c => c.h2s)}
        userSiteUrl={userSite.url}
        competitorUrls={competitorUrls}
      />

      <div className="pt-2 pb-4">
        <HeadingOutline userSite={userSite} competitors={competitors} />
      </div>

      <SectionTitle title="Contenido y Arquitectura" />

      <MetricComparisonCard
        iconLabel="📖"
        metricLabel="Resumen de Contenido"
        userValue={userSite.contentSummary}
        competitorValues={competitors.map(c => c.contentSummary)}
        userSiteUrl={userSite.url}
        competitorUrls={competitorUrls}
      />
      <MetricComparisonCard
        iconLabel="🧭"
        metricLabel="Navegación"
        userValue={userSite.navigationItems}
        competitorValues={competitors.map(c => c.navigationItems)}
        userSiteUrl={userSite.url}
        competitorUrls={competitorUrls}
      />

      <SectionTitle title="Datos Estructurados" />

      <SchemaMarkupComparison 
        userSiteUrl={userSite.url}
        userStructuredData={userSite.structuredDataTypes}
        competitors={competitors.map(c => ({
          url: c.url,
          structuredData: c.structuredDataTypes,
        }))}
      />

      {/* ── Comparable pages section ── */}
      {(userSite.comparisonPages?.serviceProductUrl || competitors.some(c => c.comparisonPages?.serviceProductUrl)) && (
        <>
          <SectionTitle title="Página Comparable (Servicio / Producto)" />
          <MetricComparisonCard
            iconLabel="🔗"
            metricLabel="URL"
            userValue={userSite.comparisonPages?.serviceProductUrl}
            competitorValues={competitors.map(c => c.comparisonPages?.serviceProductUrl)}
            isUrl
            userSiteUrl={userSite.url}
            competitorUrls={competitorUrls}
          />
          <MetricComparisonCard
            iconLabel="📝"
            metricLabel="Título"
            userValue={userSite.comparisonPages?.serviceProductTitle}
            competitorValues={competitors.map(c => c.comparisonPages?.serviceProductTitle)}
            userSiteUrl={userSite.url}
            competitorUrls={competitorUrls}
          />
          <MetricComparisonCard
            iconLabel="🔍"
            metricLabel="Meta Descripción"
            userValue={userSite.comparisonPages?.serviceProductMetaDescription}
            competitorValues={competitors.map(c => c.comparisonPages?.serviceProductMetaDescription)}
            userSiteUrl={userSite.url}
            competitorUrls={competitorUrls}
          />
          <MetricComparisonCard
            iconLabel="H1"
            metricLabel="H1"
            userValue={userSite.comparisonPages?.serviceProductH1}
            competitorValues={competitors.map(c => c.comparisonPages?.serviceProductH1)}
            userSiteUrl={userSite.url}
            competitorUrls={competitorUrls}
          />
          <MetricComparisonCard
            iconLabel="H2"
            metricLabel="H2s"
            userValue={userSite.comparisonPages?.serviceProductH2s}
            competitorValues={competitors.map(c => c.comparisonPages?.serviceProductH2s)}
            userSiteUrl={userSite.url}
            competitorUrls={competitorUrls}
          />

          <div className="pt-2 pb-4">
            <HeadingOutline 
              userSite={{
                ...userSite,
                url: userSite.comparisonPages?.serviceProductUrl || userSite.url,
                h1: userSite.comparisonPages?.serviceProductH1 || '',
                h2s: userSite.comparisonPages?.serviceProductH2s || [],
                h3s: userSite.comparisonPages?.serviceProductH3s || [],
              }}
              competitors={competitors.map(c => ({
                ...c,
                url: c.comparisonPages?.serviceProductUrl || c.url,
                h1: c.comparisonPages?.serviceProductH1 || '',
                h2s: c.comparisonPages?.serviceProductH2s || [],
                h3s: c.comparisonPages?.serviceProductH3s || [],
              }))}
            />
          </div>
          <div className="pt-2">
            <SchemaMarkupComparison 
              userSiteUrl={userSite.comparisonPages?.serviceProductUrl || userSite.url}
              userStructuredData={userSite.comparisonPages?.serviceProductStructuredDataTypes || []}
              competitors={competitors.map(c => ({
                url: c.comparisonPages?.serviceProductUrl || c.url,
                structuredData: c.comparisonPages?.serviceProductStructuredDataTypes || [],
              }))}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BenchmarkResultsDisplay;