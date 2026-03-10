import { IMonthBucket } from "./sales";

export interface IReplenishmentMetrics {
  coverage: number;
  days: number;
  suggestedUnits: number;
}

export interface IStockModalityMetrics {
  stock: number;
  replenishment: IReplenishmentMetrics;
}

export interface IMonthBucketStock extends Omit<
  IMonthBucket,
  "date" | "views" | "conversionRate"
> {
  year: number;
  month: number;
}

export interface ISalesDistribution {
  fulfillment: number;
  flex: number;
  dropOff: number;
}

export interface IStock {
  baseSku: string;

  months: IMonthBucketStock[];

  fulfillment: IStockModalityMetrics;
  storage: IStockModalityMetrics; // Galpão (physical warehouse)

  incoming: number; // A Caminho (units on order)
  damage: number;   // Avaria (damaged units)

  avgDailySales: number;
  distribution: ISalesDistribution;

  supplier: {
    _id: string;
    name: string;
  };
}
