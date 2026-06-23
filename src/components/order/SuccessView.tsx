'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Clock,
  Package,
  Home,
  RotateCcw,
} from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export function SuccessView() {
  const lastOrder = useAppStore((s) => s.lastOrder);
  const resetOrder = useAppStore((s) => s.resetOrder);

  if (!lastOrder) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <div className="w-20 h-20 rounded-full bg-islami-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-islami-600" />
            </div>
          </motion.div>
          <h2 className="font-heading font-bold text-2xl text-navy-800">
            Pesanan Berhasil Dikirim!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Terima kasih. Pesanan berhasil dikirim dan akan diverifikasi oleh admin.
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="card-shadow-lg rounded-2xl overflow-hidden mb-6">
          {/* Order Number Header */}
          <div className="bg-navy-600 px-6 py-3">
            <p className="text-navy-200 text-xs">Nomor Pesanan</p>
            <p className="text-white font-mono font-bold text-lg tracking-wider">
              {lastOrder.orderNumber}
            </p>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gold-50 border border-gold-200">
              <Clock className="h-5 w-5 text-gold-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gold-800">
                  Menunggu Verifikasi Pembayaran
                </p>
                <p className="text-xs text-gold-600">
                  Admin akan memverifikasi bukti transfer Anda
                </p>
              </div>
            </div>

            {/* Order Info */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nama Siswa</span>
                <span className="font-medium text-navy-700">
                  {lastOrder.studentName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Produk</span>
                <span className="font-medium text-navy-700">
                  {lastOrder.product}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ukuran</span>
                <Badge className="bg-navy-600 text-white text-xs">
                  {lastOrder.size}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Jumlah</span>
                <span className="font-medium text-navy-700">
                  <Package className="inline h-3 w-3 mr-1" />
                  {lastOrder.qty} pcs
                </span>
              </div>
              <div className="border-t border-navy-100 pt-2.5 flex justify-between items-center">
                <span className="font-semibold text-navy-700">Total Pembayaran</span>
                <span className="font-heading font-bold text-lg text-navy-800">
                  {formatRupiah(lastOrder.totalPrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={resetOrder}
            className="w-full bg-navy-600 hover:bg-navy-700 text-white font-semibold py-6 rounded-xl cursor-pointer"
          >
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Halaman Utama
          </Button>
          <Button
            onClick={resetOrder}
            variant="outline"
            className="w-full border-navy-200 text-navy-600 hover:bg-navy-50 font-medium py-5 rounded-xl cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Buat Pesanan Baru
          </Button>
        </div>
      </div>
    </div>
  );
}
