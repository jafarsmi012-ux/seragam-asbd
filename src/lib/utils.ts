import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 100);
}

export function generateOrderNumber(existingCount: number): string {
  const num = String(existingCount + 1).padStart(4, '0');
  return `ASBD-2026-${num}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

export function isValidFileType(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']): boolean {
  return allowedTypes.includes(file.type);
}

// ── Bukti transfer size limits (sesuai server-side & UI) ──
// Constraint: Vercel function body limit ~4.5 MB untuk JSON. Base64 = file * 4/3.
// File 3 MB → base64 ~4 MB, di bawah limit Vercel.
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;   // 3 MB untuk JPG/PNG (setelah resize)
export const MAX_PDF_BYTES = 3 * 1024 * 1024;     // 3 MB untuk PDF
export const MAX_IMAGE_DIMENSION = 1600;          // px — target resize (agresif)
export const JPEG_QUALITY = 0.75;                 // 75%
// Kalau hasil resize masih > 2 MB, kompres lebih agresif (1280px q55%)
export const AGGRESSIVE_RESIZE_THRESHOLD = 2 * 1024 * 1024;
export const AGGRESSIVE_DIMENSION = 1280;
export const AGGRESSIVE_QUALITY = 0.55;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Resize gambar di browser pakai <canvas>.
 * - Format output mengikuti format input (JPEG tetap JPEG, PNG tetap PNG).
 * - PNG tanpa alpha akan diconvert ke JPEG untuk hemat ukuran.
 * - Target: max MAX_IMAGE_DIMENSION px di sisi terpanjang.
 * - Kualitas JPEG: JPEG_QUALITY (75%) atau AGGRESSIVE_QUALITY (55%) kalau masih > 2MB.
 * - Mengembalikan File baru, file asli tidak diubah.
 *
 * Tidak berlaku untuk PDF — caller harus skip untuk PDF.
 */
export async function resizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  const imgUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Gagal membaca gambar'));
      el.src = imgUrl;
    });

    const { naturalWidth: w, naturalHeight: h } = img;
    const longest = Math.max(w, h);

    // ── Pass 1: resize normal (1600px, q75%) ──
    let result = await renderToFile(img, file, w, h, longest, MAX_IMAGE_DIMENSION, JPEG_QUALITY);

    // ── Pass 2 (agresif): kalau masih > 2 MB, kompres lebih kecil ──
    if (result.size > AGGRESSIVE_RESIZE_THRESHOLD) {
      result = await renderToFile(img, file, w, h, longest, AGGRESSIVE_DIMENSION, AGGRESSIVE_QUALITY);
    }

    return result;
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}

async function renderToFile(
  img: HTMLImageElement,
  originalFile: File,
  srcW: number,
  srcH: number,
  longest: number,
  targetDim: number,
  quality: number
): Promise<File> {
  let outW = srcW;
  let outH = srcH;
  if (longest > targetDim) {
    const scale = targetDim / longest;
    outW = Math.round(srcW * scale);
    outH = Math.round(srcH * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser tidak mendukung canvas');
  ctx.drawImage(img, 0, 0, outW, outH);

  // Deteksi PNG tanpa alpha → convert ke JPEG (lebih kecil)
  let outType = originalFile.type;
  let outName = originalFile.name;
  if (originalFile.type === 'image/png') {
    const hasAlpha = checkAlpha(ctx, outW, outH);
    if (!hasAlpha) {
      outType = 'image/jpeg';
      outName = originalFile.name.replace(/\.png$/i, '.jpg');
    }
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    if (outType === 'image/jpeg') {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    } else {
      canvas.toBlob(resolve, outType);
    }
  });

  if (!blob) throw new Error('Gagal mengompres gambar');
  return new File([blob], outName, {
    type: outType,
    lastModified: Date.now(),
  });
}

// Sampling pixel untuk deteksi alpha channel — sample 100 titik random
function checkAlpha(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  try {
    const sample = 100;
    for (let i = 0; i < sample; i++) {
      const x = Math.floor(Math.random() * w);
      const y = Math.floor(Math.random() * h);
      const data = ctx.getImageData(x, y, 1, 1).data;
      if (data[3] < 255) return true;
    }
  } catch {
    // Kalau getImageData gagal (CORS/tainted canvas), asumsikan ada alpha
    return true;
  }
  return false;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
