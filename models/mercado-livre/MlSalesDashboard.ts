import { AbcCurve, Momentum, Trend } from "@/types/enums";
import { IMlProductBase } from "@/types/mercado-livre";
import { ISalesDashboardItem } from "@/types/sales";
import mongoose, { model, models, Schema } from "mongoose";
import { EmbeddedStockSchema } from "../Stock";

const numberEnumValues = (e: object) =>
  Object.values(e).filter((v) => typeof v === "number");

const MonthBucketSchema = new Schema(
  {
    year: Number,
    month: Number,
    date: Date,
    units: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
  },
  { _id: false },
);

const MlSalesDashboardSchema = new Schema<ISalesDashboardItem<IMlProductBase>>(
  {
    productId: { type: String, required: true, unique: true, index: true },
    sku: String,
    name: String,
    image: String,
    link: String,
    price: Number,
    status: String,
    dateCreated: Date,
    logisticType: String,

    // CATALOG
    itemRelation: String,
    catalogListing: Boolean,
    //
    availableQuantity: { type: Number, default: 0 },
    months: { type: [MonthBucketSchema], default: [] },
    totals: {
      units: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
    trend: { type: Number, enum: numberEnumValues(Trend) },
    momentum: { type: Number, enum: numberEnumValues(Momentum) },
    earlySignal: { type: Number, enum: numberEnumValues(Momentum) },
    regression: {
      slope: { type: Number, default: 0 },
      intercept: { type: Number, default: 0 },
      r2: { type: Number, default: 0 },
      slopePct: { type: Number, default: 0 },
      avgRevenue: { type: Number, default: 0 },
    },

    conversionDropped: { type: Boolean, default: false },
    conversionDropPct: { type: Number, default: 0 },

    abcCurve: { type: Number, enum: numberEnumValues(AbcCurve) },
    abcCumulativePct: { type: Number, default: 0 },

    stock: {
      type: EmbeddedStockSchema,
      default: null,
    },
  },
  { timestamps: true, collection: "salesdashboard" },
);

export const MlSalesDashboard =
  models.MlSalesDashboard || model("SalesDashboard", MlSalesDashboardSchema);
