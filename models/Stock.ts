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
        coverage: { type: Number, default: 0 },
        days: { type: Number, default: 0 },
        suggestedUnits: { type: Number, default: 0 },
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

export const StockSchemaDefinition = {
  baseSku: {
    type: String,
    required: true,
  },

  months: [StockMonthBucketSchema],
  fulfillment: StockModalityMetricsSchema,
  storage: StockModalityMetricsSchema,  // Galpão

  incoming: { type: Number, default: 0 }, // A Caminho
  damage:   { type: Number, default: 0 }, // Avaria

  avgDailySales: { type: Number, default: 0 },

  supplier: new Schema(
    {
      _id: { type: Schema.Types.ObjectId, required: false },
      name: { type: String },
    },
    { _id: false },
  ),
};

export const EmbeddedStockSchema = new Schema(StockSchemaDefinition, {
  _id: false,
});

export const StockSchema = new Schema<IStock>(StockSchemaDefinition, {
  timestamps: true,
});

StockSchema.index({ baseSku: 1 }, { unique: true });

export const Stock = models.Stock || model("StockCache", StockSchema);
