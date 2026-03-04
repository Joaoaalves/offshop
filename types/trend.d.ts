import { Momentum, Trend } from "./enums";

export interface IRegression {
  slope: number;
  intercept: number;
  r2: number;
  slopePct: number;
  avgRevenue: number;
}

export interface IModalityTrend {
  trend: Trend;
  momentum: Momentum;
  earlySignal: Momentum | null;
  regression: IRegression;
}

export type IProductTrendCache = IModalityTrend & {
  productId: string;

  // Series
  revenueSeries: number[];
  conversionSeries: number[];
  //

  // Global Signals
  conversionDropped: boolean;
  conversionDropPct: number;
  //

  // Modalities
  fulfillment: IModalityTrend;
  flex: IModalityTrend;
  //

  updatedAt: Date;
};
