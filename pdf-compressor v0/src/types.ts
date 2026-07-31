export type CompressionPreset = 'extreme' | 'recommended' | 'light' | 'custom';

export interface CompressionOptions {
  preset: CompressionPreset;
  quality: number; // 0.05 to 1.0 (e.g. 0.25 for extreme)
  maxDimension: number; // Max canvas width/height in px (e.g., 800, 1200, 1600)
  dpiScale: number; // 0.4 to 1.5
  grayscale: boolean;
  removeMetadata: boolean;
  removeAnnotations: boolean;
  strategy: 'raster' | 'structural' | 'auto';
}

export interface ProgressState {
  stage: 'parsing' | 'rendering' | 'compressing' | 'assembling' | 'completed' | 'error';
  currentPage: number;
  totalPages: number;
  percent: number;
  message: string;
}

export interface CompressionResult {
  fileName: string;
  originalSize: number; // bytes
  compressedSize: number; // bytes
  savedBytes: number;
  savedPercentage: number;
  blob: Blob;
  downloadUrl: string;
  pageCount: number;
  previewUrls: string[];
  compressionTimeMs: number;
}

export interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  pageCount?: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  progress?: ProgressState;
  result?: CompressionResult;
  errorMessage?: string;
}
