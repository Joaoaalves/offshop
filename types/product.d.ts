import { ISupplier } from "./supplier";

export interface ISelfProduct {
  // Informações básicas
  baseSku: string;
  name: string;
  imageUrl?: string;
  manufacturerCode?: string;
  ncm?: string;             // Código Mercosul — 8 dígitos
  unitsPerBox?: number;
  supplier: ISupplier;

  // Preços e impostos
  tablePrice?: number;       // Preço de tabela (base)
  icms?: number;             // ICMS em %
  ipi?: number;              // IPI em %
  difal?: number;            // DIFAL em %
  storageCost?: number;      // Custo de armazenamento (fixo por ora)
  // Calculados (não persistidos)
  priceWithTaxes?: number;   // tablePrice * (1 + icms/100 + ipi/100 + difal/100)
  unitPrice?: number;        // priceWithTaxes / unitsPerBox

  // Dimensões e peso
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  volumeCm3?: number;
  weightKg?: number;
  chargeableWeightKg?: number;

  minStockDays: number;

  stock?: {
    storage: number;  // Galpão
    incoming: number; // A Caminho
    damage: number;   // Avaria
  };

  createdAt: Date;
}

export interface IExternalProduct<
  TLogistic extends string,
  TStatus extends string,
> {
  productId: string;
  sku: string;
  name: string;

  link: string;
  image: string;

  unitsPerPack: number;
  price: number;

  logisticType: TLogistic;

  dateCreated: Date;
  status: TStatus;
}

export type IProductBaseCache<TProduct extends IExternalProduct> = TProduct & {
  isNew: boolean;

  months: IMonthBucket[];
  totals: {
    units: number;
    revenue: number;
    orders: number;
    views: number;
  };
  dailyAvg45: {
    revenue: number;
    units: number;
    activeDays: number;
  };
  updatedAt: Date;
};
