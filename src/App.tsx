import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroDropzone } from './components/HeroDropzone';
import { BatchQueueView } from './components/BatchQueueView';
import { PrivacyBanner } from './components/PrivacyBanner';
import { FAQSection } from './components/FAQSection';
import { WelcomeModal } from './components/WelcomeModal';
import { BatchFileItem, CompressionOptions, ProgressState } from './types';
import { compressFile, detectFileType } from './utils/fileCompressor';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(true);
  const [queue, setQueue] = useState<BatchFileItem[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [options, setOptions] = useState<CompressionOptions>({
    preset: 'extreme',
    quality: 0.15,
    maxDimension: 650,
    dpiScale: 0.5,
    grayscale: false,
    removeMetadata: true,
    removeAnnotations: true,
    strategy: 'auto',
  });

  // Handle files selected from Hero Dropzone or file picker
  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;

    const newItems: BatchFileItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      fileType: detectFileType(file),
      originalSize: file.size,
      status: 'idle',
    }));

    setQueue((prev) => [...prev, ...newItems]);
    setErrorMsg(null);
  };

  const handleAddMoreFiles = (files: File[]) => {
    handleFileSelect(files);
  };

  const handleRemoveFile = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Run Batch Compression sequentially across queue
  const handleStartBatchCompress = async () => {
    if (queue.length === 0 || isProcessingBatch) return;

    setIsProcessingBatch(true);
    setErrorMsg(null);

    // Filter items that need processing
    const itemsToProcess = queue.filter((item) => item.status !== 'done');

    for (const item of itemsToProcess) {
      // Set current file status to processing
      setQueue((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: 'processing', errorMessage: undefined } : i
        )
      );

      try {
        const result = await compressFile(item.file, options, (progress: ProgressState) => {
          setQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
          );
        });

        setQueue((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'done', result } : i))
        );
      } catch (err: any) {
        console.error('Batch file error:', item.name, err);
        setQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error', errorMessage: err?.message || 'Compression failed' }
              : i
          )
        );
      }
    }

    setIsProcessingBatch(false);
  };

  const handleReset = () => {
    setQueue([]);
    setIsProcessingBatch(false);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white">
      {/* Welcome Popup Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />

      {/* Sticky Header */}
      <Navbar onReset={handleReset} onOpenInfo={() => setShowWelcomeModal(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-8 py-5 sm:py-12 space-y-6 sm:space-y-8">
        {/* Error Alert */}
        {errorMsg && (
          <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-3 text-amber-900 text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs font-bold text-amber-800 hover:underline shrink-0 p-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Switcher: Dropzone or Batch Queue */}
        {queue.length > 0 ? (
          <BatchQueueView
            queue={queue}
            options={options}
            onChangeOptions={setOptions}
            onAddMoreFiles={handleAddMoreFiles}
            onRemoveFile={handleRemoveFile}
            onStartBatchCompress={handleStartBatchCompress}
            onReset={handleReset}
            isProcessingBatch={isProcessingBatch}
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
