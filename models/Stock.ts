import {
  IMonthBucketStock,
  ISalesDistribution,
  IStock,
  IStockModalityMetrics,
} from "@/types/stock";
import { model, models, Schema } from "mongoose";

export const StockMonthBucketSchema = new Schema(
  {
    year: { type: Number },
    month: { type: Number },
    units: { type: Number },
    revenue: { type: Number },
    orders: { type: Number },
  },
  { _id: false },
);

export const StockModalityMetricsSchema = new Schema<IStockModalityMetrics>(
  {
    stock: { type: Number, default: 0 },
    replenishment: new Schema(
      {
        coverageDays: { type: Number, default: 0 },
        replenishmentDays: { type: Number, default: 0 },
        suggestedReplenishmentUnits: { type: Number, default: 0 },
      },
      { _id: false },
    ),
  },
  { _id: false },
);

export const DistributionSchema = new Schema<ISalesDistribution>(
  {
    fulfillment: { type: Number, default: 0 },
    flex: { type: Number, default: 0 },
    dropOff: { type: Number, default: 0 },
  },
  { _id: false },
);

export const StockSchema = new Schema<IStock>(
  {
    baseSku: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    months: [StockMonthBucketSchema],
    fulfillment: StockModalityMetricsSchema,
    flex: StockModalityMetricsSchema,

    avgDailySales: { type: Number, default: 0 },

    supplier: new Schema(
      {
        _id: { type: Schema.Types.ObjectId, required: false },
        name: { type: String },
      },
      { _id: false },
    ),
  },
  { timestamps: true },
);

export const Stock = models.Stock || model("StockCache", StockSchema);
