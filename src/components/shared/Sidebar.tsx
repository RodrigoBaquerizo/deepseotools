import React from 'react';
import { Target, BarChart2, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';

interface SidebarProps {
  activeTab: 'seo-benchmark' | 'serp-insights';
  setActiveTab: (tab: 'seo-benchmark' | 'serp-insights') => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  return (
    <>
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-40 lg:hidden print:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside 
        className={`bg-navy text-white flex flex-col h-screen fixed inset-y-0 left-0 lg:sticky lg:top-0 transition-all duration-300 z-50 ${
          collapsed ? 'w-72 lg:w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } border-r border-navy-light shadow-2xl print:hidden`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-navy-light">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center text-white shadow-lg shadow-primary/30 flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col select-none">
                <span className="font-extrabold text-sm tracking-tight text-white uppercase bg-clip-text">Deep SEO Suite</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Workspace</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Mobile close button */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg hover:bg-navy-light text-gray-400 hover:text-white lg:hidden transition-colors"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse button */}
            {!collapsed && (
              <button 
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg hover:bg-navy-light text-gray-400 hover:text-white hidden lg:block transition-colors"
                title="Colapsar menú"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* SEO Benchmark Link */}
          <button
            onClick={() => {
              setActiveTab('seo-benchmark');
              setMobileOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 group relative ${
              activeTab === 'seo-benchmark'
                ? 'bg-gradient-premium text-white shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:text-white hover:bg-navy-light/60'
            }`}
          >
            <BarChart2 className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
              activeTab === 'seo-benchmark' ? 'text-white' : 'text-gray-400 group-hover:text-white'
            }`} />
            {(!collapsed || mobileOpen) ? (
              <span className="truncate">Deep SEO Benchmark</span>
            ) : null}
            
            {/* Tooltip on collapsed desktop view */}
            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-navy border border-navy-light text-white text-xs font-extrabold rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 shadow-xl whitespace-nowrap z-50 hidden lg:block">
                Deep SEO Benchmark
              </div>
            )}

            {/* Active indicator bar */}
            {activeTab === 'seo-benchmark' && (
              <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md transition-all duration-300"></div>
            )}
          </button>

          {/* SERP Insights Link */}
          <button
            onClick={() => {
              setActiveTab('serp-insights');
              setMobileOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 group relative ${
              activeTab === 'serp-insights'
                ? 'bg-gradient-premium text-white shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:text-white hover:bg-navy-light/60'
            }`}
          >
            <Target className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
              activeTab === 'serp-insights' ? 'text-white' : 'text-gray-400 group-hover:text-white'
            }`} />
            {(!collapsed || mobileOpen) ? (
              <span className="truncate">Deep SERP Insights</span>
            ) : null}
            
            {/* Tooltip on collapsed desktop view */}
            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-navy border border-navy-light text-white text-xs font-extrabold rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 shadow-xl whitespace-nowrap z-50 hidden lg:block">
                Deep SERP Insights
              </div>
            )}

            {/* Active indicator bar */}
            {activeTab === 'serp-insights' && (
              <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md transition-all duration-300"></div>
            )}
          </button>
        </nav>

        {/* Footer / Expand Button */}
        <div className="p-4 border-t border-navy-light">
          {collapsed && !mobileOpen ? (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full flex justify-center p-2 rounded-lg hover:bg-navy-light text-gray-400 hover:text-white transition-colors"
              title="Expandir menú"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-navy-light/40">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Motor Activo</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
