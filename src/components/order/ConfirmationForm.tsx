'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  X,
  AlertTriangle,
  Image,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { getUnitPrice } from '@/data/sizePrices';
import {
  formatRupiah,
  isValidFileType,
  resizeImage,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  formatBytes,
} from '@/lib/utils';

export function ConfirmationForm() {
  const order = useAppStore((s) => s.order);
  const student = useAppStore((s) => s.student);
  const payment = useAppStore((s) => s.payment);
  const setPayment = useAppStore((s) => s.setPayment);
  const isSubmitting = useAppStore((s) => s.isSubmitting);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizedInfo, setResizedInfo] = useState<string | null>(null);

  const totalPrice = getUnitPrice(order.sizeAsbd, order.productType) * order.qty;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setResizedInfo(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidFileType(file)) {
      setFileError('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.');
      return;
    }

    // PDF: tidak di-resize, hanya cek ukuran
    if (file.type === 'application/pdf') {
      if (file.size > MAX_PDF_BYTES) {
        setFileError(
          `Ukuran PDF terlalu besar. Maksimal ${formatBytes(MAX_PDF_BYTES)}.`
        );
        return;
      }
      setResizedInfo(null);
      setPayment({ proofFile: file });
      return;
    }

    // Image: auto-resize sebelum upload
    setIsResizing(true);
    try {
      const originalBytes = file.size;
      const resized = await resizeImage(file);

      if (resized.size > MAX_IMAGE_BYTES) {
        setFileError(
          `Gambar terlalu besar setelah kompres (${formatBytes(
            resized.size
          )}). Maksimal ${formatBytes(MAX_IMAGE_BYTES)}.`
        );
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (resized.size < originalBytes) {
        const saved = Math.round((1 - resized.size / originalBytes) * 100);
        setResizedInfo(
          `Dikecilkan ${saved}% (${formatBytes(originalBytes)} → ${formatBytes(
            resized.size
          )})`
        );
      } else {
        setResizedInfo(null);
      }
      setPayment({ proofFile: resized });
    } catch (err) {
      console.error('Resize error:', err);
      setFileError('Gagal memproses gambar. Coba file lain.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsResizing(false);
    }
  };

  const removeFile = () => {
    setPayment({ proofFile: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFileError(null);
    setResizedInfo(null);
  };

  const getFileIcon = () => {
    if (!payment.proofFile) return null;
    const type = payment.proofFile.type;
    if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    return <Image className="h-5 w-5 text-islami-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-navy-600" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-navy-800">
            Upload Bukti Transfer
          </h3>
          <p className="text-xs text-muted-foreground">
            Upload bukti transfer untuk mengirim pesanan
          </p>
        </div>
      </div>

      {/* Order Recap */}
      <Card className="card-shadow rounded-xl border-navy-100">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-navy-500 mb-2 uppercase tracking-wider">
            Ringkasan Pesanan
          </p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Siswa</span>
              <span className="font-medium text-navy-700">{student.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kelas</span>
              <span className="font-medium text-navy-700">{student.className || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Produk</span>
              <span className="font-medium text-navy-700">{order.productType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ukuran</span>
              <Badge className="bg-navy-600 text-white text-xs">{order.sizeAsbd}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah</span>
              <span className="font-medium text-navy-700">{order.qty} pcs</span>
            </div>
            <div className="border-t border-navy-100 pt-1.5 mt-1.5 flex justify-between">
              <span className="font-semibold text-navy-700">Total Pembayaran</span>
              <span className="font-heading font-bold text-navy-800">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Bukti Transfer */}
      <Card className="card-shadow rounded-xl border-navy-100">
        <CardContent className="p-4 space-y-4">
          <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
            Bukti Transfer
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={isSubmitting || isResizing}
          />

          {payment.proofFile ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-islami-200 bg-islami-50">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-700 truncate">
                  {payment.proofFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(payment.proofFile.size)}
                  {resizedInfo && (
                    <span className="text-islami-600 ml-1">• {resizedInfo}</span>
                  )}
                </p>
              </div>
              <button
                onClick={removeFile}
                className="text-destructive hover:bg-destructive/10 rounded-lg p-1.5 transition-colors cursor-pointer"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : isResizing ? (
            <div className="w-full p-8 rounded-xl border-2 border-navy-200 bg-navy-50/30 flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 text-navy-400 animate-spin" />
              <p className="text-sm text-muted-foreground">Mengompres gambar...</p>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 rounded-xl border-2 border-dashed border-navy-200 bg-white hover:border-navy-400 hover:bg-navy-50/30 transition-all duration-200 cursor-pointer flex flex-col items-center gap-3"
              disabled={isSubmitting || isResizing}
            >
              <div className="w-14 h-14 rounded-full bg-navy-50 flex items-center justify-center">
                <Upload className="h-7 w-7 text-navy-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-navy-700">
                  Klik untuk upload bukti transfer
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG atau PNG (otomatis dikecilkan) maks. 3MB · PDF maks. 3MB
                </p>
              </div>
            </button>
          )}

          {fileError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {fileError}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
