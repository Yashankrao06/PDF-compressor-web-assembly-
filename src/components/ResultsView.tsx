import React from 'react';
import { Download, CheckCircle2, ArrowRight, RefreshCw, FileText, Sparkles, ShieldCheck, Clock, Layers } from 'lucide-react';
import { CompressionResult } from '../types';
import { formatBytes } from '../utils/fileCompressor';

interface ResultsViewProps {
  result: CompressionResult;
  onCompressAnother: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onCompressAnother }) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = result.downloadUrl;
    // Append _compressed suffix
    const dotIndex = result.fileName.lastIndexOf('.');
    const baseName = dotIndex !== -1 ? result.fileName.substring(0, dotIndex) : result.fileName;
    const ext = dotIndex !== -1 ? result.fileName.substring(dotIndex) : '.pdf';
    a.download = `${baseName}_compressed${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isSavedPositive = result.savedPercentage > 0;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Main Success Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-10 shadow-xl text-stone-900 relative overflow-hidden">
        {/* Top Decorative Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-emerald-600" />

        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mb-1">
            <CheckCircle2 className="w-8 h-8 stroke-[2]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            File Compressed Successfully
          </h2>
          <p className="text-xs font-mono font-bold text-stone-500 max-w-md mx-auto truncate px-2">
            {result.fileName}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Original Size */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 sm:p-4 text-center">
            <span className="text-xs uppercase font-extrabold tracking-wider text-stone-500">Original Size</span>
            <div className="text-xl sm:text-2xl font-mono font-bold text-stone-400 mt-1 line-through">
              {formatBytes(result.originalSize)}
            </div>
            <span className="text-[11px] text-stone-500 mt-0.5 block">Before compression pass</span>
          </div>

          {/* Compressed Size */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 sm:p-4 text-center">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">Compressed Size</span>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-700 mt-1">
              {formatBytes(result.compressedSize)}
            </div>
            <span className="text-[11px] text-emerald-800 mt-0.5 block font-bold">New file size</span>
          </div>

          {/* Space Saved Percentage */}
          <div className="bg-stone-900 text-white border border-stone-800 rounded-xl p-3.5 sm:p-4 text-center shadow-md">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">Space Saved</span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white mt-1 flex items-center justify-center gap-1">
              <span>{isSavedPositive ? `-${result.savedPercentage}%` : 'Optimal'}</span>
            </div>
            <span className="text-[11px] text-stone-400 mt-0.5 block font-semibold">
              Saved {formatBytes(result.savedBytes)}
            </span>
          </div>
        </div>

        {/* Visual Storage Meter Bar */}
        <div className="mt-6 bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-stone-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reduction Ratio</span>
            </span>
            <span className="text-emerald-700 font-mono font-bold">
              {formatBytes(result.compressedSize)} / {formatBytes(result.originalSize)}
            </span>
          </div>
          <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden p-0.5 border border-stone-300">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(8, 100 - result.savedPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-stone-500 font-medium pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Speed: {result.compressionTimeMs}ms (AI Local Pipeline)</span>
            </span>
            <span>{result.pageCount} Pages</span>
          </div>
        </div>

        {/* Page Preview Thumbnails (if available) */}
        {result.previewUrls && result.previewUrls.length > 0 && (
          <div className="mt-6 pt-6 border-t border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Visual Quality Preview (Page Thumbnails)</span>
            </h4>
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {result.previewUrls.map((url, index) => (
                <div key={index} className="shrink-0 group relative">
                  <img
                    src={url}
                    alt={`Page ${index + 1}`}
                    className="w-28 h-36 object-cover rounded-lg border border-stone-200 shadow-xs group-hover:border-emerald-600 transition-colors bg-white"
                  />
                  <span className="absolute bottom-1 right-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-900 text-white">
                    P. {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Download Button */}
        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full py-4 px-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5 stroke-[2]" />
            <span>Download Compressed File</span>
          </button>

          <button
            type="button"
            onClick={onCompressAnother}
            className="w-full py-3 px-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-stone-200"
          >
            <RefreshCw className="w-4 h-4 text-stone-500" />
            <span>Compress Another File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
