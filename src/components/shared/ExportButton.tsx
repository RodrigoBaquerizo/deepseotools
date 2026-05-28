import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Presentation, ChevronDown, Check } from 'lucide-react';

interface ExportButtonProps {
  onExportPdf: () => void;
  onExportPptx: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ onExportPdf, onExportPptx }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = (format: string, active: boolean) => {
    if (!active) return;
    setIsOpen(false);
    if (format === 'pdf') {
      onExportPdf();
    } else if (format === 'pptx') {
      onExportPptx();
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-600 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all duration-200 active:scale-95"
        title="Exportar reporte"
      >
        <Download className="w-4 h-4" />
        <span>Exportar</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-100 shadow-premium p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 origin-top-right">
          <div className="px-3 py-2 border-b border-gray-50 mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Formatos disponibles</span>
          </div>

          {/* Opción PDF */}
          <button
            onClick={() => handleExportClick('pdf', true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-rose-50/50 text-gray-700 hover:text-rose-700 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500 group-hover:bg-rose-100 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Documento PDF</span>
                <span className="text-[9px] text-gray-400 font-medium">Reporte listo para imprimir</span>
              </div>
            </div>
          </button>

          {/* Opción PowerPoint (PPT) */}
          <button
            onClick={() => handleExportClick('pptx', true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left hover:bg-orange-50/50 text-gray-700 hover:text-orange-600 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500 group-hover:bg-orange-100 transition-colors">
                <Presentation className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Presentación PPT</span>
                <span className="text-[9px] text-gray-400 font-medium">Diapositivas listas para editar</span>
              </div>
            </div>
          </button>

          {/* Opción Word - Desactivado */}
          <button
            disabled
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-gray-400 cursor-not-allowed opacity-60"
            title="Próximamente"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Documento Word</span>
                <span className="text-[9px] text-gray-400 font-medium">Próximamente</span>
              </div>
            </div>
          </button>

          {/* Opción Excel - Desactivado */}
          <button
            disabled
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-gray-400 cursor-not-allowed opacity-60"
            title="Próximamente"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Hoja de Cálculo Excel</span>
                <span className="text-[9px] text-gray-400 font-medium">Próximamente</span>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
