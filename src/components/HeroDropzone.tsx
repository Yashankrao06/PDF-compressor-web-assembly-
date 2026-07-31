import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck2, Shield, AlertCircle, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { detectFileType } from '../utils/fileCompressor';

interface HeroDropzoneProps {
  onFileSelect: (files: File[]) => void;
}

export const HeroDropzone: React.FC<HeroDropzoneProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndPassFiles = (fileList: FileList | File[]) => {
    const validFiles: File[] = [];
    setErrorMsg(null);

    const filesArray = Array.from(fileList);
    for (const file of filesArray) {
      const type = detectFileType(file);
      if (type !== 'unknown') {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setErrorMsg('Please select valid files (.pdf, .jpg, .png, .webp, or .docx format).');
      return;
    }

    onFileSelect(validFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPassFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPassFiles(e.target.files);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-5 sm:p-12 text-center transition-all duration-200 bg-white ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/10 scale-[1.01]'
            : 'border-stone-200 hover:border-emerald-500 hover:shadow-md'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="application/pdf,image/jpeg,image/png,image/webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.jpg,.jpeg,.png,.webp,.docx"
          multiple
          className="hidden"
        />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4 sm:space-y-5">
          {/* Upload Icon Circle */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
              isDragOver
                ? 'bg-emerald-600 text-white scale-110 shadow-md'
                : 'bg-stone-50 text-stone-400 group-hover:bg-emerald-600 group-hover:text-white'
            }`}
          >
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.75]" />
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
              Ready for High Batch Compression
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
              Drag one or multiple files here (PDF, JPG, PNG, WEBP, or DOCX) to shrink them instantly.
            </p>
          </div>

          {/* Format Badges */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
              <FileText className="w-3.5 h-3.5 text-emerald-600" /> PDF Documents
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Images (JPG/PNG/WebP)
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-700" /> Word (.DOCX)
            </span>
          </div>

          {/* Action CTA */}
          <div className="pt-1 sm:pt-2 w-full flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 stroke-[2]" />
              <span>Select Files to Compress</span>
            </button>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Privacy Guarantee Footer inside dropzone */}
          <div className="pt-3 sm:pt-4 border-t border-stone-100 w-full max-w-lg mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-stone-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Private (No uploads)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Batch Queue Supported</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
