import React from 'react';
import { FileText } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset }) => {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-stone-200 px-4 sm:px-8 flex items-center justify-between bg-white text-[#1C1917] shadow-xs">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={onReset}
          className="flex items-center gap-3 group text-left focus:outline-none rounded-lg p-1"
        >
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
            <FileText className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight uppercase text-stone-900">
                PDF<span className="text-emerald-600">Shrink</span>
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1">
                <span>✨ AI Powered</span>
              </span>
            </div>
          </div>
        </button>

        {/* Status badges */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-stone-600 text-xs font-semibold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>AI Neural Compression Active</span>
          </div>

          <div className="hidden sm:block px-3 py-1 bg-stone-100 rounded-full border border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-600">
            Local Processing Only
          </div>
        </div>
      </div>
    </header>
  );
};
