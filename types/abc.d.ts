import { AbcCurve } from "./enums";

export interface IProductAbc {
  productId: string;
  abcCurve: AbcCurve;

  totalRevenue: number;
  cumulativeRevenue: number;
  grandTotalRevenue: number;
  abcCumulativePct: number;

  updatedAt: Date;
}
