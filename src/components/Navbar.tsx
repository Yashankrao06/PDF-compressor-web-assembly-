import React from 'react';
import { FileText } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
  onOpenInfo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset, onOpenInfo }) => {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-stone-200 px-3 sm:px-8 flex items-center justify-between bg-white text-[#1C1917] shadow-xs">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-2">
        {/* Logo */}
        <button
          onClick={onReset}
          className="flex items-center gap-2.5 group text-left focus:outline-none rounded-lg p-1 min-h-[44px]"
        >
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors shrink-0">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight uppercase text-stone-900">
                File<span className="text-emerald-600">Shrink</span> <span className="text-stone-500 font-medium text-xs">AI</span>
              </span>
              <span className="hidden xs:inline-flex text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 items-center gap-1">
                <span>✨ Universal</span>
              </span>
            </div>
          </div>
        </button>

        {/* Status badges + Info Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInfo}
            className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-bold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
            title="View Platform Features & Creator Info"
          >
            <span>Features & Info</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-stone-600 text-xs font-semibold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>AI Local Compression</span>
          </div>
        </div>
      </div>
    </header>
  );
};
