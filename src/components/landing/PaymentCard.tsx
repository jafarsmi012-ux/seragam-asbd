'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PaymentCard() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const accountNumber = '3520670474';

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
    <section className="max-w-4xl mx-auto px-4 py-12">
      <Card className="card-shadow-lg rounded-2xl overflow-hidden border-l-4 border-l-navy-500">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Bank Transfer
              </p>
              <p className="text-xl font-heading font-bold text-navy-700">
                Bank BCA
              </p>
            </div>
          </div>

          {/* Account Number */}
          <div className="bg-navy-50 rounded-xl p-4 mb-4">
            <p className="text-xs font-medium text-navy-500 mb-1">
              Nomor Rekening
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-2xl md:text-3xl font-mono font-bold text-navy-800 tracking-wider">
                {accountNumber}
              </p>
              <Button
                variant={copied ? 'ghost' : 'outline'}
                size="sm"
                onClick={handleCopy}
                className={`flex-shrink-0 cursor-pointer ${
                  copied
                    ? 'text-islami-600 border-islami-300 bg-islami-50'
                    : 'border-navy-200 text-navy-600 hover:bg-navy-100'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Disalin
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Salin
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Account Holder */}
          <div className="mb-5">
            <p className="text-xs font-medium text-muted-foreground mb-0.5">
              Atas Nama
            </p>
            <p className="text-base font-semibold text-navy-700">
              Dede Taufik Hidayatulloh
            </p>
          </div>

          {/* Note */}
          <div className="flex gap-3 p-3 rounded-xl bg-gold-50 border border-gold-200">
            <AlertCircle className="h-5 w-5 text-gold-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gold-800 leading-relaxed">
              Pastikan nominal transfer sesuai dengan total pesanan agar proses
              verifikasi lebih cepat.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
