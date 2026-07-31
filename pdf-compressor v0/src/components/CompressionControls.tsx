import React from 'react';
import { Zap, ShieldCheck, Settings2, Sliders, Check, AlertTriangle } from 'lucide-react';
import { CompressionOptions, CompressionPreset } from '../types';

interface CompressionControlsProps {
  options: CompressionOptions;
  onChangeOptions: (updated: CompressionOptions) => void;
  onStartCompress: () => void;
  fileName: string;
  fileSizeFormatted: string;
  pageCount?: number;
}

export const CompressionControls: React.FC<CompressionControlsProps> = ({
  options,
  onChangeOptions,
  onStartCompress,
  fileName,
  fileSizeFormatted,
  pageCount,
}) => {
  const selectPreset = (preset: CompressionPreset) => {
    let quality = 0.42;
    let maxDimension = 1100;
    let dpiScale = 0.9;

    if (preset === 'extreme') {
      quality = 0.18;
      maxDimension = 750;
      dpiScale = 0.6;
    } else if (preset === 'recommended') {
      quality = 0.42;
      maxDimension = 1100;
      dpiScale = 0.9;
    } else if (preset === 'light') {
      quality = 0.70;
      maxDimension = 1600;
      dpiScale = 1.2;
    } else if (preset === 'custom') {
      quality = options.quality || 0.35;
      maxDimension = options.maxDimension || 900;
      dpiScale = options.dpiScale || 0.75;
    }

    onChangeOptions({
      ...options,
      preset,
      quality,
      maxDimension,
      dpiScale,
      strategy: preset === 'light' ? 'structural' : 'raster',
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xl text-stone-900">
      {/* File Info Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600">Selected Document</span>
          <h3 className="text-lg font-bold text-stone-900 truncate max-w-md">{fileName}</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-stone-100 border border-stone-200 text-xs font-mono font-bold text-stone-700">
            Original: {fileSizeFormatted}
          </div>
          {pageCount && pageCount > 0 && (
            <div className="px-3 py-1 rounded-lg bg-stone-100 border border-stone-200 text-xs font-mono font-bold text-stone-700">
              {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
            </div>
          )}
        </div>
      </div>

      {/* Preset Cards */}
      <div className="mt-6">
        <label className="block text-xs font-extrabold uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>Compression Profile</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Extreme Preset */}
          <button
            type="button"
            onClick={() => selectPreset('extreme')}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              options.preset === 'extreme'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-stone-50 border-stone-200 hover:border-stone-300 hover:bg-stone-100/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">⚡ Max Saving</span>
              {options.preset === 'extreme' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <h4 className="font-bold text-base mt-1 text-stone-900">Extreme</h4>
            <p className="text-xs text-stone-500 mt-1">Shrinks to tiny sizes (~80-95% saved). High compression for strict upload limits.</p>
          </button>

          {/* Recommended Preset */}
          <button
            type="button"
            onClick={() => selectPreset('recommended')}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              options.preset === 'recommended'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-stone-50 border-stone-200 hover:border-stone-300 hover:bg-stone-100/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">⭐ Recommended</span>
              {options.preset === 'recommended' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <h4 className="font-bold text-base mt-1 text-stone-900">Balanced</h4>
            <p className="text-xs text-stone-500 mt-1">Optimal balance between clarity & file size (~50-80% saved).</p>
          </button>

          {/* Light Preset */}
          <button
            type="button"
            onClick={() => selectPreset('light')}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              options.preset === 'light'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-stone-50 border-stone-200 hover:border-stone-300 hover:bg-stone-100/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">🎯 High Quality</span>
              {options.preset === 'light' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <h4 className="font-bold text-base mt-1 text-stone-900">Light / Lossless</h4>
            <p className="text-xs text-stone-500 mt-1">Metadata stripping & stream optimization without resolution changes.</p>
          </button>

          {/* Custom Preset */}
          <button
            type="button"
            onClick={() => selectPreset('custom')}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              options.preset === 'custom'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-stone-50 border-stone-200 hover:border-stone-300 hover:bg-stone-100/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">🛠️ Custom</span>
              {options.preset === 'custom' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <h4 className="font-bold text-base mt-1 text-stone-900">Manual Controls</h4>
            <p className="text-xs text-stone-500 mt-1">Fine-tune image quality percentage and resolution scale sliders.</p>
          </button>
        </div>
      </div>

      {/* Advanced Toggles */}
      <div className="mt-6 pt-6 border-t border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-stone-700 flex items-center gap-2 cursor-pointer">
            <Sliders className="w-4 h-4 text-stone-500" />
            <span>Convert to Monochrome / Grayscale</span>
          </label>
          <input
            type="checkbox"
            checked={options.grayscale}
            onChange={(e) => onChangeOptions({ ...options, grayscale: e.target.checked })}
            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-stone-700 flex items-center gap-2 cursor-pointer">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strip Sensitive PDF Metadata & Author Tags</span>
          </label>
          <input
            type="checkbox"
            checked={options.removeMetadata}
            onChange={(e) => onChangeOptions({ ...options, removeMetadata: e.target.checked })}
            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Custom Fine-Tuning Drawer */}
      {options.preset === 'custom' && (
        <div className="mt-4 p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-4">
          <div>
            <div className="flex justify-between text-xs text-stone-600 mb-1">
              <span>Image Compression Quality</span>
              <span className="font-mono font-bold text-emerald-700">{Math.round(options.quality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.05"
              value={options.quality}
              onChange={(e) => onChangeOptions({ ...options, quality: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-600 mb-1">
              <span>Max Longest Dimension Limit</span>
              <span className="font-mono font-bold text-emerald-700">{options.maxDimension || 900} px</span>
            </div>
            <input
              type="range"
              min="400"
              max="1800"
              step="50"
              value={options.maxDimension || 900}
              onChange={(e) => onChangeOptions({ ...options, maxDimension: parseInt(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>
      )}

      {/* Start Button */}
      <div className="mt-8">
        <button
          type="button"
          onClick={onStartCompress}
          className="w-full py-4 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5 fill-white" />
          <span>Start Local WASM Compression</span>
        </button>
      </div>
    </div>
  );
};
