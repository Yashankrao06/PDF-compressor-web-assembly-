import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroDropzone } from './components/HeroDropzone';
import { CompressionControls } from './components/CompressionControls';
import { ProcessingView } from './components/ProcessingView';
import { ResultsView } from './components/ResultsView';
import { PrivacyBanner } from './components/PrivacyBanner';
import { FAQSection } from './components/FAQSection';
import { CompressionOptions, CompressionResult, ProgressState } from './types';
import { compressPDF, formatBytes, getPDFPageCount } from './utils/pdfCompressor';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [options, setOptions] = useState<CompressionOptions>({
    preset: 'extreme',
    quality: 0.18,
    maxDimension: 750,
    dpiScale: 0.6,
    grayscale: false,
    removeMetadata: true,
    removeAnnotations: true,
    strategy: 'auto',
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProgressState | undefined>(undefined);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0]; // Primary focus on single/MVP file path
    setSelectedFile(file);
    setResult(null);
    setErrorMsg(null);

    // Fast page count estimate
    try {
      const pages = await getPDFPageCount(file);
      setPageCount(pages);
    } catch {
      setPageCount(1);
    }
  };

  // Execute Compression
  const handleStartCompress = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const compResult = await compressPDF(selectedFile, options, (p) => {
        setProgress(p);
      });

      setResult(compResult);
    } catch (err: any) {
      console.error('Compression error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during compression.');
    } finally {
      setIsProcessing(false);
      setProgress(undefined);
    }
  };

  // Reset to initial drop state
  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setIsProcessing(false);
    setProgress(undefined);
    setErrorMsg(null);
    setPageCount(undefined);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Sticky Header */}
      <Navbar onReset={handleReset} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Error Alert */}
        {errorMsg && (
          <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 text-amber-900 text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs font-bold text-amber-800 hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Switcher based on current flow state */}
        {isProcessing ? (
          <ProcessingView progress={progress} fileName={selectedFile?.name || 'Document.pdf'} />
        ) : result ? (
          <ResultsView result={result} onCompressAnother={handleReset} />
        ) : selectedFile ? (
          <CompressionControls
            options={options}
            onChangeOptions={setOptions}
            onStartCompress={handleStartCompress}
            fileName={selectedFile.name}
            fileSizeFormatted={formatBytes(selectedFile.size)}
            pageCount={pageCount}
          />
        ) : (
          <div className="space-y-10">
            {/* Hero Dropzone */}
            <HeroDropzone onFileSelect={handleFileSelect} />

            {/* Privacy Feature Highlights */}
            <PrivacyBanner />

            {/* Frequently Asked Questions */}
            <FAQSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-stone-200 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-600 font-medium gap-3 bg-white">
        <div className="font-bold uppercase tracking-wider text-stone-500 text-[11px]">
          Engine v3.0 (AI Local Compressor)
        </div>

        <div className="flex items-center gap-2">
          <span>Created by <strong className="text-stone-900 font-bold">Yashank</strong></span>
          <span className="text-stone-300">•</span>
          <a
            href="https://www.linkedin.com/in/yashank-rao-ben-61761533b/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-600 font-bold underline transition-colors"
          >
            LinkedIn
          </a>
          <span className="text-stone-300">•</span>
          <a
            href="https://github.com/Yashankrao06"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-800 hover:text-emerald-600 font-bold underline transition-colors"
          >
            GitHub
          </a>
        </div>

        <div className="uppercase font-bold tracking-wider text-stone-500 text-[11px]">
          100% Client-Side • Privacy First
        </div>
      </footer>
    </div>
  );
}
