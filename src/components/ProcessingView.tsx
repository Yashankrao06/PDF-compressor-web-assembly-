import React from 'react';
import { Loader2, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { ProgressState } from '../types';

interface ProcessingViewProps {
  progress?: ProgressState;
  fileName: string;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ progress, fileName }) => {
  const percent = progress?.percent ?? 20;

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-stone-200 rounded-xl p-8 shadow-xl text-center text-stone-900 space-y-6">
      {/* Animated Spinner Ring */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-stone-100 border-t-emerald-600 border-r-emerald-600/50 animate-spin" />
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
          <Cpu className="w-7 h-7 animate-pulse text-emerald-600" />
        </div>
      </div>

      {/* Progress Information */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 flex items-center justify-center gap-1.5">
          <Zap className="w-3.5 h-3.5 fill-emerald-600" />
          <span>Local WASM Engine Active</span>
        </span>
        <h3 className="text-lg font-bold text-stone-900 mt-2 truncate px-4">{fileName}</h3>
        <p className="text-xs text-stone-500 mt-1">{progress?.message || 'Optimizing document streams and embedded graphics...'}</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 max-w-md mx-auto">
        <div className="flex justify-between text-xs font-mono font-bold text-stone-600">
          <span>
            {progress?.totalPages && progress.totalPages > 0
              ? `Page ${progress.currentPage} of ${progress.totalPages}`
              : 'Optimizing'}
          </span>
          <span className="text-emerald-600">{percent}%</span>
        </div>

        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300 ease-out shadow-xs"
            style={{ width: `${Math.max(5, percent)}%` }}
          />
        </div>
      </div>

      {/* Security reassurance during processing */}
      <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-2 text-xs text-stone-500 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>100% Private processing on your browser CPU</span>
      </div>
    </div>
  );
};
