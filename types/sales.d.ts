import { IProductAbc } from "./abc";
import { IExternalProduct, IProductBaseCache } from "./product";
import { IStock } from "./stock";
import { IProductTrendCache } from "./trend";

export interface IModalityMetrics {
  items: number;
  revenue: number;
  orders: number;
}

export interface IMonthBucket {
  year: number;
  month: number;
  date: Date;
  views: number;

  conversionRate: number;

  fulfillment: IModalityMetrics;
  flex: IModalityMetrics;
  dropOff: IModalityMetrics;
}

export interface ISaleBucket {
  date: Date;
  product: string;
  sku: string;

  unitPrice: number;

  // Modalities
  total: IModalityMetrics;
  fulfillment: IModalityMetrics;
  flex: IModalityMetrics;
  dropOff: IModalityMetrics;
  //

  createdAt?: Date;
  updatedAt?: Date;
}

export type ISalesDashboardItem<TProduct extends IProductBaseCache> = TProduct &
  IProductTrendCache &
  IProductAbc & {
    stock: IStock;
  };
