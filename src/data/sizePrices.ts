export interface SizePrice {
  id: number;
  sizeAsbd: number;
  chestCm: number;
  pantsLengthCm: number;
  pantsWaistCm: number;
  priceSet: number;
  priceShirt: number;
  pricePants: number;
}

export const sizePrices: SizePrice[] = [
  {
    id: 1,
    sizeAsbd: 1,
    chestCm: 102,
    pantsLengthCm: 72,
    pantsWaistCm: 88,
    priceSet: 275000,
    priceShirt: 180000,
    pricePants: 110000,
  },
  {
    id: 2,
    sizeAsbd: 2,
    chestCm: 110,
    pantsLengthCm: 77,
    pantsWaistCm: 92,
    priceSet: 275000,
    priceShirt: 190000,
    pricePants: 110000,
  },
  {
    id: 3,
    sizeAsbd: 3,
    chestCm: 118,
    pantsLengthCm: 80,
    pantsWaistCm: 100,
    priceSet: 295000,
    priceShirt: 200000,
    pricePants: 120000,
  },
  {
    id: 4,
    sizeAsbd: 4,
    chestCm: 122,
    pantsLengthCm: 82,
    pantsWaistCm: 104,
    priceSet: 295000,
    priceShirt: 200000,
    pricePants: 120000,
  },
  {
    id: 5,
    sizeAsbd: 5,
    chestCm: 129,
    pantsLengthCm: 88,
    pantsWaistCm: 106,
    priceSet: 295000,
    priceShirt: 200000,
    pricePants: 120000,
  },
  {
    id: 6,
    sizeAsbd: 6,
    chestCm: 133,
    pantsLengthCm: 93,
    pantsWaistCm: 110,
    priceSet: 315000,
    priceShirt: 220000,
    pricePants: 125000,
  },
  {
    id: 7,
    sizeAsbd: 7,
    chestCm: 138,
    pantsLengthCm: 98,
    pantsWaistCm: 116,
    priceSet: 315000,
    priceShirt: 220000,
    pricePants: 125000,
  },
  {
    id: 8,
    sizeAsbd: 8,
    chestCm: 141,
    pantsLengthCm: 102,
    pantsWaistCm: 118,
    priceSet: 315000,
    priceShirt: 220000,
    pricePants: 125000,
  },
  {
    id: 9,
    sizeAsbd: 9,
    chestCm: 145,
    pantsLengthCm: 107,
    pantsWaistCm: 122,
    priceSet: 350000,
    priceShirt: 250000,
    pricePants: 140000,
  },
  {
    id: 10,
    sizeAsbd: 10,
    chestCm: 149,
    pantsLengthCm: 112,
    pantsWaistCm: 126,
    priceSet: 350000,
    priceShirt: 250000,
    pricePants: 140000,
  },
  {
    id: 11,
    sizeAsbd: 11,
    chestCm: 153,
    pantsLengthCm: 117,
    pantsWaistCm: 130,
    priceSet: 350000,
    priceShirt: 250000,
    pricePants: 140000,
  },
  {
    id: 12,
    sizeAsbd: 12,
    chestCm: 157,
    pantsLengthCm: 122,
    pantsWaistCm: 134,
    priceSet: 350000,
    priceShirt: 250000,
    pricePants: 140000,
  },
];

export type ProductType = 'Stelan Baju + Celana' | 'Baju saja' | 'Celana saja';

export function getSizePrice(sizeAsbd: number): SizePrice | undefined {
  return sizePrices.find((s) => s.sizeAsbd === sizeAsbd);
}

export function getUnitPrice(sizeAsbd: number, productType: ProductType): number {
  const size = getSizePrice(sizeAsbd);
  if (!size) return 0;
  switch (productType) {
    case 'Stelan Baju + Celana':
      return size.priceSet;
    case 'Baju saja':
      return size.priceShirt;
    case 'Celana saja':
      return size.pricePants;
    default:
      return 0;
  }
}

export function getTotalPrice(sizeAsbd: number, productType: ProductType, qty: number): number {
  return getUnitPrice(sizeAsbd, productType) * qty;
}
