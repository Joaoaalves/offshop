import { ISupplier } from "./supplier";

export type ProductType = "simples" | "kit" | "combo" | "variacao";

export interface IProductComponent {
  product: ISelfProduct | string; // populated or ObjectId string
  quantity: number;
}

export interface ISelfProduct {
  productType: ProductType;

  // Informações básicas
  baseSku: string;
  tinyId: string;
  name: string;
  imageUrl?: string;
  manufacturerCode?: string;
  ncm?: string; // Código Mercosul — 8 dígitos
  unitsPerBox?: number;
  supplier: ISupplier;

  // Pricing
  cost: number;            // box cost (what we pay per box)
  icms?: number;           // % ICMS
  ipi?: number;            // % IPI
  difal?: number;          // % DIFAL
  storageCost?: number;    // fixed storage cost per unit (R$)
  priceWithTaxes?: number; // derived: (cost/unitsPerBox) * (1 + (icms+ipi+difal)/100) + storageCost
  // unitPrice is derived at runtime: cost / unitsPerBox — NOT stored in DB

  // Dimensões e peso
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  volumeM3?: number;
  weightKg?: number;
  chargeableWeightKg?: number;

  minStockDays: number;

  // Kit
  kitQuantity?: number;
  parentProduct?: ISelfProduct | string;

  // Combo
  components?: IProductComponent[];

  stock?: {
    storage: number;    // Galpão
    incoming: number;   // A Caminho
    fulfillment: number; // Fulfillment ML
    damage: number;     // Avaria
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
