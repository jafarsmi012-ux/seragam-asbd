'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { sizePrices } from '@/data/sizePrices';
import { formatRupiah } from '@/lib/utils';
import { Ruler, ArrowRight, ShoppingCart } from 'lucide-react';

interface SizeChartProps {
  onSelectSize?: (sizeAsbd: number) => void;
}

export function SizeChart({ onSelectSize }: SizeChartProps) {
  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <Card className="card-shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-navy-600 text-white pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-400/20 flex items-center justify-center">
              <Ruler className="h-4 w-4 text-gold-300" />
            </div>
            <div>
              <CardTitle className="text-xl font-heading font-bold">
                Tabel Ukuran & Harga
              </CardTitle>
              <CardDescription className="text-navy-200 text-sm">
                Pilih ukuran yang sesuai untuk siswa
              </CardDescription>
            </div>
          </div>
          {onSelectSize && (
            <p className="text-navy-200/70 text-xs mt-2">
              Klik ukuran untuk langsung mulai pemesanan
            </p>
          )}
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-navy-100">
                  <TableHead className="font-semibold text-navy-700 bg-navy-50">
                    Ukuran
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 bg-navy-50">
                    Lingkar Dada
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 bg-navy-50">
                    Panjang Celana
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 bg-navy-50">
                    Lingkar Celana
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 bg-navy-50 text-right">
                    Harga Stelan
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 bg-navy-50 text-right">
                    Harga Baju
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 bg-navy-50 text-right">
                    Harga Celana
                  </TableHead>
                  {onSelectSize && (
                    <TableHead className="font-semibold text-navy-700 bg-navy-50 text-center w-20">
                      Pilih
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizePrices.map((item, idx) => (
                  <TableRow
                    key={item.sizeAsbd}
                    className={`transition-colors duration-150 ${
                      onSelectSize
                        ? 'cursor-pointer hover:bg-navy-100/60 active:bg-navy-200/70'
                        : ''
                    } ${idx % 2 === 0 ? 'bg-white' : 'bg-navy-50/40'}`}
                    onClick={() => onSelectSize?.(item.sizeAsbd)}
                  >
                    <TableCell className="font-medium">
                      <Badge
                        variant="outline"
                        className={`font-semibold transition-all ${
                          onSelectSize
                            ? 'border-navy-300 text-navy-700 bg-navy-50 hover:bg-navy-600 hover:text-white hover:border-navy-600'
                            : 'border-navy-300 text-navy-700 bg-navy-50'
                        }`}
                      >
                        {item.sizeAsbd}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.chestCm} cm</TableCell>
                    <TableCell>{item.pantsLengthCm} cm</TableCell>
                    <TableCell>{item.pantsWaistCm} cm</TableCell>
                    <TableCell className="text-right font-semibold text-navy-700">
                      {formatRupiah(item.priceSet)}
                    </TableCell>
                    <TableCell className="text-right text-navy-600">
                      {formatRupiah(item.priceShirt)}
                    </TableCell>
                    <TableCell className="text-right text-navy-600">
                      {formatRupiah(item.pricePants)}
                    </TableCell>
                    {onSelectSize && (
                      <TableCell className="text-center">
                        <button
                          className="inline-flex items-center gap-1 text-xs font-medium text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg px-2 py-1 transition-colors cursor-pointer"
                          title={`Pesan ukuran ${item.sizeAsbd}`}
                        >
                          <ShoppingCart className="h-3 w-3" />
                          Pesan
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            {sizePrices.map((item) => (
              <Card
                key={item.sizeAsbd}
                className={`card-shadow rounded-xl border-navy-100 transition-all duration-200 ${
                  onSelectSize
                    ? 'cursor-pointer hover:border-navy-400 hover:shadow-md active:scale-[0.98]'
                    : ''
                }`}
                onClick={() => onSelectSize?.(item.sizeAsbd)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-navy-600 text-white font-bold">
                      Ukuran {item.sizeAsbd}
                    </Badge>
                    {onSelectSize && (
                      <ArrowRight className="h-3.5 w-3.5 text-navy-300" />
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-navy-600">
                    <div className="flex justify-between">
                      <span>Lingkar Dada</span>
                      <span className="font-medium">{item.chestCm} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pjg. Celana</span>
                      <span className="font-medium">{item.pantsLengthCm} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lingkar Celana</span>
                      <span className="font-medium">{item.pantsWaistCm} cm</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-navy-100 space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-navy-500">Stelan</span>
                      <span className="font-bold text-navy-700">
                        {formatRupiah(item.priceSet)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-navy-500">Baju</span>
                      <span className="font-medium text-navy-600">
                        {formatRupiah(item.priceShirt)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-navy-500">Celana</span>
                      <span className="font-medium text-navy-600">
                        {formatRupiah(item.pricePants)}
                      </span>
                    </div>
                  </div>
                  {onSelectSize && (
                    <div className="mt-2 pt-2 border-t border-navy-100/60">
                      <span className="text-[10px] font-medium text-navy-400 flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        Tap untuk pesan ukuran ini
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Note */}
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Ukuran dalam sentimeter. Harga dapat berubah sewaktu-waktu.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
