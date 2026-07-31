import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck2, Shield, AlertCircle, FileText } from 'lucide-react';

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
    const validPdfFiles: File[] = [];
    setErrorMsg(null);

    const filesArray = Array.from(fileList);
    for (const file of filesArray) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        validPdfFiles.push(file);
      }
    }

    if (validPdfFiles.length === 0) {
      setErrorMsg('Please select a valid PDF file (.pdf format).');
      return;
    }

    onFileSelect(validPdfFiles);
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
        className={`relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 bg-white ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/10 scale-[1.01]'
            : 'border-stone-200 hover:border-emerald-500 hover:shadow-md'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="application/pdf"
          multiple
          className="hidden"
        />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-5">
          {/* Upload Icon Circle */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
              isDragOver
                ? 'bg-emerald-600 text-white scale-110 shadow-md'
                : 'bg-stone-50 text-stone-400 group-hover:bg-emerald-600 group-hover:text-white'
            }`}
          >
            <UploadCloud className="w-10 h-10 stroke-[1.75]" />
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Ready for High-Compression
            </h2>
            <p className="text-sm text-stone-500 mt-1 max-w-xs mx-auto">
              Drag your PDF here or select a file to compress it instantly in browser.
            </p>
          </div>

          {/* Action CTA */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 stroke-[2]" />
              <span>Browse Local PDF Files</span>
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
          <div className="pt-4 border-t border-stone-100 w-full max-w-lg mx-auto flex items-center justify-center gap-6 text-xs text-stone-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Private (No uploads)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free & Unlimited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
