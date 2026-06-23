'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Copy, CheckCircle2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah } from '@/lib/utils';
import { getSizePrice, getUnitPrice } from '@/data/sizePrices';

export function PaymentStep() {
  const order = useAppStore((s) => s.order);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const accountNumber = '3520670474';
  const selectedSize = getSizePrice(order.sizeAsbd);
  const unitPrice = getUnitPrice(order.sizeAsbd, order.productType);
  const totalPrice = unitPrice * order.qty;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      toast({
        title: 'Berhasil disalin!',
        description: 'Nomor rekening berhasil disalin ke clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Gagal menyalin',
        description: 'Silakan salin manual: ' + accountNumber,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
          <Shield className="h-4 w-4 text-navy-600" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-navy-800">
            Pembayaran
          </h3>
          <p className="text-xs text-muted-foreground">
            Transfer sesuai total pembayaran
          </p>
        </div>
      </div>

      {/* Total Payment */}
      <Card className="card-shadow rounded-xl border-gold-300 bg-gradient-to-br from-gold-50 to-white">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-gold-700 font-medium mb-1">
            Total Pembayaran
          </p>
          <p className="font-heading font-bold text-2xl md:text-3xl text-navy-800">
            {formatRupiah(totalPrice)}
          </p>
          {selectedSize && (
            <div className="mt-2 flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span>{order.productType} × {order.qty}</span>
              <span>•</span>
              <span>Ukuran {order.sizeAsbd}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Info */}
      <Card className="card-shadow rounded-xl border-navy-100 border-l-4 border-l-navy-500">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-heading font-bold text-navy-700">Bank BCA</p>
              <p className="text-xs text-muted-foreground">Transfer ke rekening berikut</p>
            </div>
          </div>

          <div className="bg-navy-50 rounded-xl p-3">
            <p className="text-xs text-navy-500 mb-1">Nomor Rekening</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xl md:text-2xl font-mono font-bold text-navy-800 tracking-wider">
                {accountNumber}
              </p>
              <Button
                variant={copied ? 'ghost' : 'outline'}
                size="sm"
                onClick={handleCopy}
                className={`flex-shrink-0 cursor-pointer text-xs ${
                  copied
                    ? 'text-islami-600 border-islami-300 bg-islami-50'
                    : 'border-navy-200 text-navy-600 hover:bg-navy-100'
                }`}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {copied ? 'Disalin' : 'Salin'}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Atas Nama</p>
            <p className="text-sm font-semibold text-navy-700">
              Dede Taufik Hidayatulloh
            </p>
          </div>

          {/* Transfer Instructions */}
          <div className="bg-islami-50 rounded-xl p-3 border border-islami-100">
            <p className="text-xs font-semibold text-islami-700 mb-1">
              Petunjuk Transfer:
            </p>
            <ol className="text-xs text-islami-600 space-y-1 list-decimal list-inside">
              <li>Buka aplikasi m-banking atau ATM terdekat</li>
              <li>Transfer ke rekening BCA di atas</li>
              <li>
                Pastikan nominal transfer: <strong>{formatRupiah(totalPrice)}</strong>
              </li>
              <li>Simpan bukti transfer untuk langkah selanjutnya</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
