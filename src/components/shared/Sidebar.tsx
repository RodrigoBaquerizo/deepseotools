import React from 'react';
import { Target, BarChart2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: 'seo-benchmark' | 'serp-insights';
  setActiveTab: (tab: 'seo-benchmark' | 'serp-insights') => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  return (
    <aside 
      className={`bg-navy text-white flex flex-col h-screen sticky top-0 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-72'
      } border-r border-navy-light shadow-2xl`}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-navy-light">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col select-none">
              <span className="font-extrabold text-sm tracking-tight text-white uppercase bg-clip-text">Deep SEO Suite</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Workspace</span>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-navy-light text-gray-400 hover:text-white transition-colors"
            title="Colapsar menú"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {/* SEO Benchmark Link */}
        <button
          onClick={() => setActiveTab('seo-benchmark')}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 group relative ${
            activeTab === 'seo-benchmark'
              ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-600/20'
              : 'text-gray-400 hover:text-white hover:bg-navy-light/60'
          }`}
        >
          <BarChart2 className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
            activeTab === 'seo-benchmark' ? 'text-white' : 'text-gray-400 group-hover:text-white'
          }`} />
          {!collapsed && (
            <span className="truncate">Deep SEO Benchmark</span>
          )}
          {/* Active indicator bar */}
          {activeTab === 'seo-benchmark' && (
            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md"></div>
          )}
        </button>

        {/* SERP Insights Link */}
        <button
          onClick={() => setActiveTab('serp-insights')}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 group relative ${
            activeTab === 'serp-insights'
              ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-600/20'
              : 'text-gray-400 hover:text-white hover:bg-navy-light/60'
          }`}
        >
          <Target className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
            activeTab === 'serp-insights' ? 'text-white' : 'text-gray-400 group-hover:text-white'
          }`} />
          {!collapsed && (
            <span className="truncate">Deep SERP Insights</span>
          )}
          {/* Active indicator bar */}
          {activeTab === 'serp-insights' && (
            <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md"></div>
          )}
        </button>
      </nav>

      {/* Footer / Expand Button */}
      <div className="p-4 border-t border-navy-light">
        {collapsed ? (
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
  );
};
