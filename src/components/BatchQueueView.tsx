import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Trash2,
  Download,
  CheckCircle2,
  Loader2,
  Plus,
  Play,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { BatchFileItem, CompressionOptions, SupportedFileType } from '../types';
import { formatBytes } from '../utils/fileCompressor';
import { CompressionControls } from './CompressionControls';

interface BatchQueueViewProps {
  queue: BatchFileItem[];
  options: CompressionOptions;
  onChangeOptions: (opts: CompressionOptions) => void;
  onAddMoreFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onStartBatchCompress: () => void;
  onReset: () => void;
  isProcessingBatch: boolean;
}

export const BatchQueueView: React.FC<BatchQueueViewProps> = ({
  queue,
  options,
  onChangeOptions,
  onAddMoreFiles,
  onRemoveFile,
  onStartBatchCompress,
  onReset,
  isProcessingBatch,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const totalOriginalBytes = queue.reduce((acc, item) => acc + item.originalSize, 0);
  const totalCompressedBytes = queue.reduce((acc, item) => {
    return acc + (item.result ? item.result.compressedSize : item.originalSize);
  }, 0);

  const completedCount = queue.filter((i) => i.status === 'done').length;
  const isAllDone = completedCount === queue.length && queue.length > 0;
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalCompressedBytes);
  const totalSavedPercent =
    totalOriginalBytes > 0 ? Math.round((totalSavedBytes / totalOriginalBytes) * 100) : 0;

  const handleAddFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddMoreFiles(Array.from(e.target.files));
    }
  };

  const getFileIcon = (type: SupportedFileType) => {
    if (type === 'image') return <ImageIcon className="w-5 h-5 text-blue-600" />;
    if (type === 'docx') return <FileSpreadsheet className="w-5 h-5 text-indigo-600" />;
    return <FileText className="w-5 h-5 text-emerald-600" />;
  };

  const handleDownloadSingle = (item: BatchFileItem) => {
    if (!item.result) return;
    const a = document.createElement('a');
    a.href = item.result.downloadUrl;
    a.download = item.result.fileName;
    a.click();
  };

  const handleDownloadAll = () => {
    queue.forEach((item) => {
      if (item.result) {
        setTimeout(() => handleDownloadSingle(item), 200);
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Hidden file input for adding more files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAddFileInput}
        accept="application/pdf,image/jpeg,image/png,image/webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.jpg,.jpeg,.png,.webp,.docx"
        multiple
        className="hidden"
      />

      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900">Compression Queue</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-stone-100 text-stone-700 border border-stone-200">
              {queue.length} {queue.length === 1 ? 'file' : 'files'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Total Queue Size: <strong className="text-stone-800">{formatBytes(totalOriginalBytes)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingBatch}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Add Files</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={isProcessingBatch}
            className="px-3 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 font-bold text-xs transition-all disabled:opacity-50"
            title="Clear All Queue"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Global Compression Settings */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <CompressionControls
          options={options}
          onChangeOptions={onChangeOptions}
          onStartCompress={onStartBatchCompress}
          fileName={`${queue.length} files in queue`}
          fileSizeFormatted={formatBytes(totalOriginalBytes)}
          isBatchMode={true}
          isProcessingBatch={isProcessingBatch}
        />
      </div>

      {/* Summary Banner if batch finished */}
      {isAllDone && (
        <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">Batch Compression Completed!</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Saved {formatBytes(totalSavedBytes)} ({totalSavedPercent}% total reduction across all files)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadAll}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-emerald-900 font-extrabold text-sm uppercase tracking-wider hover:bg-stone-100 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download All Files</span>
          </button>
        </div>
      )}

      {/* Files List Queue */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 px-1">
          Files in Queue
        </h3>

        {queue.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border p-4 transition-all ${
              item.status === 'processing'
                ? 'border-emerald-500 ring-2 ring-emerald-500/10 shadow-md'
                : item.status === 'done'
                ? 'border-emerald-200 bg-emerald-50/20'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Left: Icon + File Details */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center shrink-0">
                  {getFileIcon(item.fileType)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm truncate max-w-xs sm:max-w-md">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      {item.fileType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                    <span>Original: {formatBytes(item.originalSize)}</span>

                    {item.result && (
                      <>
                        <span>→</span>
                        <span className="font-bold text-emerald-700">
                          {formatBytes(item.result.compressedSize)} (-{item.result.savedPercentage}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Status / Action */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {item.status === 'idle' && (
                  <button
                    type="button"
                    onClick={() => onRemoveFile(item.id)}
                    disabled={isProcessingBatch}
                    className="p-2 text-stone-400 hover:text-rose-600 transition-colors disabled:opacity-30"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {item.status === 'processing' && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>
                      {item.progress ? `${item.progress.percent}% - ${item.progress.stage}` : 'Processing...'}
                    </span>
                  </div>
                )}

                {item.status === 'done' && item.result && (
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Done</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                )}

                {item.status === 'error' && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    Error compressing
                  </span>
                )}
              </div>
            </div>

            {/* Individual progress bar if processing */}
            {item.status === 'processing' && item.progress && (
              <div className="mt-3 w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-200 rounded-full"
                  style={{ width: `${item.progress.percent}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
