import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import JSZip from 'jszip';
import { CompressionOptions, CompressionResult, ProgressState, SupportedFileType } from '../types';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

/**
 * Detect file type from file name and MIME type
 */
export function detectFileType(file: File): SupportedFileType {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf';
  }
  if (
    type.startsWith('image/') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp') ||
    name.endsWith('.bmp')
  ) {
    return 'image';
  }
  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return 'docx';
  }
  return 'unknown';
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
 * Compress an Image File (JPG, PNG, WebP) directly using Canvas
 */
async function compressImage(
  file: File,
  options: CompressionOptions,
  onProgress?: (progress: ProgressState) => void
): Promise<CompressionResult> {
  const startTime = performance.now();
  const originalSize = file.size;

  onProgress?.({
    stage: 'parsing',
    currentPage: 1,
    totalPages: 1,
    percent: 20,
    message: 'Loading image data...',
  });

  const imageUrl = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageUrl;
  });

  onProgress?.({
    stage: 'compressing',
    currentPage: 1,
    totalPages: 1,
    percent: 50,
    message: 'Downsampling and compressing pixels...',
  });

  let targetMaxDim = options.maxDimension || 800;
  let quality = options.quality || 0.20;

  if (options.preset === 'extreme') {
    targetMaxDim = Math.min(targetMaxDim, 600);
    quality = 0.08;
  } else if (options.preset === 'recommended') {
    targetMaxDim = Math.min(targetMaxDim, 1000);
    quality = 0.30;
  } else if (options.preset === 'light') {
    targetMaxDim = 1600;
    quality = 0.75;
  }

  const origMaxDim = Math.max(img.width, img.height);
  let scale = 1.0;
  if (origMaxDim > targetMaxDim && options.preset !== 'light') {
    scale = targetMaxDim / origMaxDim;
  }

  const targetWidth = Math.max(1, Math.floor(img.width * scale));
  const targetHeight = Math.max(1, Math.floor(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  if (options.grayscale) {
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  const compressedBlob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas image conversion failed'))),
      'image/jpeg',
      quality
    );
  });

  URL.revokeObjectURL(imageUrl);

  const previewUrl = canvas.toDataURL('image/jpeg', 0.4);
  const finalSize = compressedBlob.size;
  const savedBytes = Math.max(0, originalSize - finalSize);
  const savedPercentage = Math.round((savedBytes / originalSize) * 100);
  const downloadUrl = URL.createObjectURL(compressedBlob);
  const endTime = performance.now();

  onProgress?.({
    stage: 'completed',
    currentPage: 1,
    totalPages: 1,
    percent: 100,
    message: 'Image compression complete!',
  });

  return {
    fileName: file.name.replace(/\.[^/.]+$/, '') + '-compressed.jpg',
    fileType: 'image',
    originalSize,
    compressedSize: finalSize,
    savedBytes,
    savedPercentage,
    blob: compressedBlob,
    downloadUrl,
    previewUrls: [previewUrl],
    compressionTimeMs: Math.round(endTime - startTime),
  };
}

/**
 * Compress DOCX File by downsampling embedded images inside word/media/
 */
async function compressDocx(
  file: File,
  options: CompressionOptions,
  onProgress?: (progress: ProgressState) => void
): Promise<CompressionResult> {
  const startTime = performance.now();
  const originalSize = file.size;

  onProgress?.({
    stage: 'parsing',
    currentPage: 1,
    totalPages: 1,
    percent: 15,
    message: 'Extracting DOCX file structure...',
  });

  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const mediaFiles = Object.keys(zip.files).filter((path) =>
    path.startsWith('word/media/') && !zip.files[path].dir
  );

  let quality = options.quality || 0.25;
  let targetMaxDim = options.maxDimension || 800;
  if (options.preset === 'extreme') {
    quality = 0.10;
    targetMaxDim = 600;
  }

  let processedCount = 0;
  for (const mediaPath of mediaFiles) {
    processedCount++;
    onProgress?.({
      stage: 'compressing',
      currentPage: processedCount,
      totalPages: mediaFiles.length || 1,
      percent: 20 + Math.round((processedCount / (mediaFiles.length || 1)) * 60),
      message: `Compressing DOCX media asset ${processedCount} of ${mediaFiles.length}...`,
    });

    try {
      const fileData = await zip.files[mediaPath].async('blob');
      const imgUrl = URL.createObjectURL(fileData);
      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgUrl;
      });

      const scale = Math.min(1.0, targetMaxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.floor(img.width * scale));
      const h = Math.max(1, Math.floor(img.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        const compressedMediaBlob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', quality));
        const newMediaBuffer = await compressedMediaBlob.arrayBuffer();
        zip.file(mediaPath, newMediaBuffer);
      }
      URL.revokeObjectURL(imgUrl);
    } catch (e) {
      console.warn('Could not compress media asset in docx:', mediaPath, e);
    }
  }

  onProgress?.({
    stage: 'assembling',
    currentPage: 1,
    totalPages: 1,
    percent: 90,
    message: 'Re-building compressed DOCX document...',
  });

  const compressedDocxBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const finalSize = compressedDocxBlob.size;
  const savedBytes = Math.max(0, originalSize - finalSize);
  const savedPercentage = Math.round((savedBytes / originalSize) * 100);
  const downloadUrl = URL.createObjectURL(compressedDocxBlob);
  const endTime = performance.now();

  onProgress?.({
    stage: 'completed',
    currentPage: 1,
    totalPages: 1,
    percent: 100,
    message: 'DOCX compression complete!',
  });

  return {
    fileName: file.name,
    fileType: 'docx',
    originalSize,
    compressedSize: finalSize,
    savedBytes,
    savedPercentage,
    blob: compressedDocxBlob,
    downloadUrl,
    previewUrls: [],
    compressionTimeMs: Math.round(endTime - startTime),
  };
}

/**
 * Compress PDF File
 */
async function compressPDF(
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
      fileType: 'pdf',
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

  const newPdfDoc = await PDFDocument.create();
  const previewUrls: string[] = [];

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });

  const pdfJsDoc = await loadingTask.promise;

  let targetMaxDim = options.maxDimension || 550;
  let quality = options.quality || 0.12;

  if (options.preset === 'extreme') {
    targetMaxDim = options.maxDimension || 420;
    quality = options.quality || 0.04;
  } else if (options.preset === 'recommended') {
    targetMaxDim = options.maxDimension || 680;
    quality = options.quality || 0.20;
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
    if (!ctx) throw new Error('Canvas context unavailable');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low';

    await page.render({ canvasContext: ctx, viewport: renderViewport, canvas } as any).promise;

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

    if (pageNum <= 3) {
      previewUrls.push(canvas.toDataURL('image/jpeg', 0.3));
    }

    const jpegBlob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
    );

    if (!jpegBlob) throw new Error('Failed to generate compressed page ' + pageNum);

    const jpegArrayBuffer = await jpegBlob.arrayBuffer();
    const embeddedImage = await newPdfDoc.embedJpg(jpegArrayBuffer);

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
    fileType: 'pdf',
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
}

/**
 * Universal Unified File Compression Entrypoint
 */
export async function compressFile(
  file: File,
  options: CompressionOptions,
  onProgress?: (progress: ProgressState) => void
): Promise<CompressionResult> {
  const type = detectFileType(file);

  if (type === 'image') {
    return compressImage(file, options, onProgress);
  }
  if (type === 'docx') {
    return compressDocx(file, options, onProgress);
  }
  return compressPDF(file, options, onProgress);
}

/**
 * Backwards compatible helper for PDF page count
 */
export async function getPDFPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch {
    return 1;
  }
}
