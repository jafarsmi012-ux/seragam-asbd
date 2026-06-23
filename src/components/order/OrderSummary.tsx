'use client';

import { useAppStore } from '@/lib/store';
import { getSizePrice, getUnitPrice } from '@/data/sizePrices';
import { formatRupiah } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';

export function OrderSummary() {
  const order = useAppStore((s) => s.order);
  const student = useAppStore((s) => s.student);

  if (order.sizeAsbd === 0) return null;

  const selectedSize = getSizePrice(order.sizeAsbd);
  const unitPrice = getUnitPrice(order.sizeAsbd, order.productType);
  const totalPrice = unitPrice * order.qty;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-navy-100 shadow-lg z-20 md:static md:border md:rounded-xl md:shadow-none md:z-0">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <ShoppingBag className="h-4 w-4 text-navy-500 flex-shrink-0" />
            <div className="min-w-0">
              {student.name && (
                <p className="text-xs font-medium text-navy-700 truncate">
                  {student.name}
                </p>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-navy-200 text-navy-600">
                  Uk {order.sizeAsbd}
                </Badge>
                <span className="text-[10px] text-muted-foreground truncate">
                  {order.productType} × {order.qty}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="font-heading font-bold text-navy-800 text-sm">
              {formatRupiah(totalPrice)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
