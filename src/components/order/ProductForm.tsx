'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Package, AlertTriangle } from 'lucide-react';
import {
  sizePrices,
  type ProductType,
  getSizePrice,
  getUnitPrice,
  getTotalPrice,
} from '@/data/sizePrices';
import { formatRupiah } from '@/lib/utils';

const productTypes: { value: ProductType; label: string; description: string }[] = [
  {
    value: 'Stelan Baju + Celana',
    label: 'Stelan Baju + Celana',
    description: 'Hemat! Beli set lengkap baju dan celana',
  },
  {
    value: 'Baju saja',
    label: 'Baju Saja',
    description: 'Hanya baju seragam ASBD',
  },
  {
    value: 'Celana saja',
    label: 'Celana Saja',
    description: 'Hanya celana seragam ASBD',
  },
];

export function ProductForm() {
  const order = useAppStore((s) => s.order);
  const setOrder = useAppStore((s) => s.setOrder);

  const selectedSize = getSizePrice(order.sizeAsbd);
  const unitPrice = getUnitPrice(order.sizeAsbd, order.productType);
  const totalPrice = getTotalPrice(order.sizeAsbd, order.productType, order.qty);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
          <ShoppingBag className="h-4 w-4 text-navy-600" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-navy-800">
            Pilih Pesanan
          </h3>
          <p className="text-xs text-muted-foreground">
            Pilih jenis produk, ukuran, dan jumlah
          </p>
        </div>
      </div>

      {/* Product Type */}
      <Card className="card-shadow rounded-xl border-navy-100">
        <CardContent className="p-4 space-y-3">
          <Label className="text-sm font-medium text-navy-700">
            Jenis Produk <span className="text-destructive">*</span>
          </Label>
          <div className="space-y-2">
            {productTypes.map((pt) => {
              const isSelected = order.productType === pt.value;
              return (
                <button
                  key={pt.value}
                  onClick={() =>
                    setOrder({
                      productType: pt.value,
                    })
                  }
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-navy-500 bg-navy-50'
                      : 'border-navy-100 bg-white hover:border-navy-200 hover:bg-navy-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'border-navy-600 bg-navy-600'
                          : 'border-navy-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          isSelected ? 'text-navy-800' : 'text-navy-600'
                        }`}
                      >
                        {pt.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{pt.description}</p>
                    </div>
                    <Package className="h-4 w-4 text-navy-300 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Size Selection */}
      <Card className="card-shadow rounded-xl border-navy-100">
        <CardContent className="p-4 space-y-3">
          <Label className="text-sm font-medium text-navy-700">
            Ukuran ASBD <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {sizePrices.map((sp) => {
              const isSelected = order.sizeAsbd === sp.sizeAsbd;
              return (
                <button
                  key={sp.sizeAsbd}
                  onClick={() => setOrder({ sizeAsbd: sp.sizeAsbd })}
                  className={`py-2 px-1 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-navy-600 bg-navy-600 text-white shadow-sm'
                      : 'border-navy-100 bg-white text-navy-600 hover:border-navy-300 hover:bg-navy-50'
                  }`}
                >
                  <span className="text-sm font-bold block">{sp.sizeAsbd}</span>
                  <span className="text-[10px] opacity-70">{sp.chestCm}cm</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quantity */}
      <Card className="card-shadow rounded-xl border-navy-100">
        <CardContent className="p-4 space-y-3">
          <Label className="text-sm font-medium text-navy-700">
            Jumlah (Quantity)
          </Label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOrder({ qty: Math.max(1, order.qty - 1) })}
              className="w-10 h-10 rounded-lg border-2 border-navy-200 flex items-center justify-center text-navy-700 font-bold hover:bg-navy-50 transition-colors cursor-pointer text-lg"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-navy-800 font-heading">
                {order.qty}
              </span>
            </div>
            <button
              onClick={() => setOrder({ qty: Math.min(10, order.qty + 1) })}
              className="w-10 h-10 rounded-lg border-2 border-navy-200 flex items-center justify-center text-navy-700 font-bold hover:bg-navy-50 transition-colors cursor-pointer text-lg"
            >
              +
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Price Summary (shows when size selected) */}
      {selectedSize && order.sizeAsbd > 0 && (
        <Card className="card-shadow rounded-xl border-gold-200 bg-gold-50">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-4 w-4 text-gold-600" />
              <span className="font-heading font-semibold text-gold-800 text-sm">
                Ringkasan Pesanan
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gold-700">Ukuran</span>
              <span className="font-medium text-gold-900 text-right">
                <Badge className="bg-navy-600 text-white text-xs mr-1">
                  {order.sizeAsbd}
                </Badge>
              </span>
              <span className="text-gold-700">Lingkar Dada</span>
              <span className="font-medium text-gold-900 text-right">
                {selectedSize.chestCm} cm
              </span>
              <span className="text-gold-700">Panjang Celana</span>
              <span className="font-medium text-gold-900 text-right">
                {selectedSize.pantsLengthCm} cm
              </span>
              <span className="text-gold-700">Lingkar Celana</span>
              <span className="font-medium text-gold-900 text-right">
                {selectedSize.pantsWaistCm} cm
              </span>
              <span className="text-gold-700">Harga Satuan</span>
              <span className="font-medium text-gold-900 text-right">
                {formatRupiah(unitPrice)}
              </span>
              <span className="text-gold-700">Jumlah</span>
              <span className="font-medium text-gold-900 text-right">
                {order.qty} pcs
              </span>
            </div>
            <div className="border-t border-gold-300 pt-2 mt-2 flex justify-between items-center">
              <span className="font-semibold text-gold-800">Total Harga</span>
              <span className="font-heading font-bold text-lg text-navy-800">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {order.sizeAsbd === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gold-50 border border-gold-200 text-sm text-gold-800">
          <AlertTriangle className="h-4 w-4 text-gold-600 flex-shrink-0" />
          <span>Pilih ukuran terlebih dahulu untuk melihat detail harga.</span>
        </div>
      )}
    </div>
  );
}
