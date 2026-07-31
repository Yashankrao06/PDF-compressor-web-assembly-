import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
// Import local bundled worker from pdfjs-dist via Vite URL resolver
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { CompressionOptions, CompressionResult, ProgressState } from '../types';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

/**
 * Gets page count of a PDF file quickly
 */
export async function getPDFPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch (err) {
    console.warn('Fallback parsing page count:', err);
    return 1;
  }
}

/**
 * Format raw byte count into human readable MB or KB
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Main PDF Compression Engine
 */
export async function compressPDF(
  file: File,
  options: CompressionOptions,
  onProgress?: (progress: ProgressState) => void
): Promise<CompressionResult> {
  const startTime = performance.now();
  const originalSize = file.size;

  onProgress?.({
    stage: 'parsing',
    currentPage: 0,
    totalPages: 0,
    percent: 5,
    message: 'Analyzing PDF structure and stream contents...',
  });

  const arrayBuffer = await file.arrayBuffer();

  let sourceDoc: PDFDocument;
  let totalPages = 1;

  try {
    sourceDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    totalPages = sourceDoc.getPageCount();
  } catch (err) {
    throw new Error('Failed to parse PDF file. The file may be password-protected or corrupted.');
  }

  // Structural metadata/stream optimization baseline
  const generateStructuralVersion = async (): Promise<{ bytes: Uint8Array }> => {
    const cleanDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    if (options.removeMetadata) {
      cleanDoc.setTitle('');
      cleanDoc.setAuthor('');
      cleanDoc.setSubject('');
      cleanDoc.setCreator('');
      cleanDoc.setProducer('');
      cleanDoc.setKeywords([]);
      cleanDoc.setCreationDate(new Date(0));
      cleanDoc.setModificationDate(new Date(0));
    }
    const bytes = await cleanDoc.save({ useObjectStreams: true });
    return { bytes };
  };

  const structuralResult = await generateStructuralVersion();

  // If Light preset is selected
  if (options.preset === 'light' || options.strategy === 'structural') {
    onProgress?.({
      stage: 'assembling',
      currentPage: totalPages,
      totalPages,
      percent: 90,
      message: 'Applying stream compression & stripping metadata...',
    });

    const compressedBlob = new Blob([structuralResult.bytes], { type: 'application/pdf' });
    const finalSize = compressedBlob.size;
    const savedBytes = Math.max(0, originalSize - finalSize);
    const savedPercentage = Math.round((savedBytes / originalSize) * 100);

    const downloadUrl = URL.createObjectURL(compressedBlob);
    const endTime = performance.now();

    onProgress?.({
      stage: 'completed',
      currentPage: totalPages,
      totalPages,
      percent: 100,
      message: 'Compression finished!',
    });

    return {
      fileName: file.name,
      originalSize,
      compressedSize: finalSize,
      savedBytes,
      savedPercentage,
      blob: compressedBlob,
      downloadUrl,
      pageCount: totalPages,
      previewUrls: [],
      compressionTimeMs: Math.round(endTime - startTime),
    };
  }

  // High-Yield Image Downsampling & Raster Re-encoding Pipeline using PDF.js & Canvas
  const newPdfDoc = await PDFDocument.create();
  const previewUrls: string[] = [];

  try {
    // Load document via PDF.js with local bundled worker
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    });

    const pdfJsDoc = await loadingTask.promise;

    // Target downsampling parameters according to preset
    let targetMaxDim = options.maxDimension || 600;
    let quality = options.quality || 0.15;

    if (options.preset === 'extreme') {
      targetMaxDim = options.maxDimension || 480; // Compact 480px canvas max for extreme shrinking
      quality = options.quality || 0.05; // 5% quality for ultra small size
    } else if (options.preset === 'recommended') {
      targetMaxDim = options.maxDimension || 720;
      quality = options.quality || 0.25;
    } else if (options.preset === 'custom') {
      targetMaxDim = options.maxDimension || 600;
      quality = options.quality || 0.15;
    }

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const currentPercent = Math.round(10 + ((pageNum - 1) / totalPages) * 75);

      onProgress?.({
        stage: 'compressing',
        currentPage: pageNum,
        totalPages,
        percent: currentPercent,
        message: `Compressing page ${pageNum} of ${totalPages}...`,
      });

      const page = await pdfJsDoc.getPage(pageNum);
      const origViewport = page.getViewport({ scale: 1.0 });

      const origMaxDim = Math.max(origViewport.width, origViewport.height);
      let scale = targetMaxDim / origMaxDim;

      if (options.preset === 'custom' && options.dpiScale) {
        scale = options.dpiScale;
      }

      const renderViewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(renderViewport.width));
      canvas.height = Math.max(1, Math.floor(renderViewport.height));

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context unavailable');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'low';

      // Render page content onto canvas
      await page.render({ canvasContext: ctx, viewport: renderViewport, canvas } as any).promise;

      // Grayscale for extreme or enabled
      const shouldGrayscale = options.grayscale || (options.preset === 'extreme' && options.grayscale !== false);

      if (shouldGrayscale) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // First 3 pages preview
      if (pageNum <= 3) {
        previewUrls.push(canvas.toDataURL('image/jpeg', 0.3));
      }

      // Convert canvas to compressed JPEG blob
      const jpegBlob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
      );

      if (!jpegBlob) {
        throw new Error('Failed to generate compressed image for page ' + pageNum);
      }

      const jpegArrayBuffer = await jpegBlob.arrayBuffer();
      const embeddedImage = await newPdfDoc.embedJpg(jpegArrayBuffer);

      // Match original PDF page dimensions (points)
      const newPage = newPdfDoc.addPage([origViewport.width, origViewport.height]);
      newPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: origViewport.width,
        height: origViewport.height,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    onProgress?.({
      stage: 'assembling',
      currentPage: totalPages,
      totalPages,
      percent: 92,
      message: 'Finalizing compressed PDF file structure...',
    });

    const compressedPdfBytes = await newPdfDoc.save({ useObjectStreams: true });
    const finalBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });

    const finalSize = finalBlob.size;
    const savedBytes = Math.max(0, originalSize - finalSize);
    const savedPercentage = Math.round((savedBytes / originalSize) * 100);
    const downloadUrl = URL.createObjectURL(finalBlob);
    const endTime = performance.now();

    onProgress?.({
      stage: 'completed',
      currentPage: totalPages,
      totalPages,
      percent: 100,
      message: 'Compression complete!',
    });

    return {
      fileName: file.name,
      originalSize,
      compressedSize: finalSize,
      savedBytes,
      savedPercentage,
      blob: finalBlob,
      downloadUrl,
      pageCount: totalPages,
      previewUrls,
      compressionTimeMs: Math.round(endTime - startTime),
    };
  } catch (err: any) {
    console.error('Raster compression error:', err);
    throw new Error(`Compression engine error: ${err?.message || 'Could not rasterize PDF pages.'}`);
  }
}
