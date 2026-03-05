import { AbcCurve, Momentum, Trend } from "@/types/enums";
import { IMlSalesDashboardProduct, ISalesDashboardItem } from "@/types/sales";
import { model, models, Schema } from "mongoose";
import { EmbeddedStockSchema } from "../Stock";

const numberEnumValues = (e: object) =>
  Object.values(e).filter((v) => typeof v === "number");

const MonthBucketSchema = new Schema(
  {
    year: Number,
    month: Number,
    date: Date,
    views: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    total: {
      items: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
    },
    fulfillment: {
      items: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
    },
    flex: {
      items: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
    },
    dropOff: {
      items: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
    },
  },
  { _id: false },
);

const RegressionSchema = new Schema(
  {
    slope: { type: Number, default: 0 },
    intercept: { type: Number, default: 0 },
    r2: { type: Number, default: 0 },
    slopePct: { type: Number, default: 0 },
    avgRevenue: { type: Number, default: 0 },
  },
  { _id: false },
);

const EmbeddedProductSchema = new Schema<IMlSalesDashboardProduct>(
  {
    productId: { type: String, required: true },
    sku: String,
    name: String,
    image: String,
    link: String,
    price: Number,
    status: String,
    dateCreated: Date,
    logisticType: String,
    itemRelation: String,
    catalogListing: Boolean,
    availableQuantity: { type: Number, default: 0 },
    isNew: { type: Boolean, default: false },
    months: { type: [MonthBucketSchema], default: [] },
    totals: {
      units: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
    dailyAvg45: {
      revenue: { type: Number, default: 0 },
      units: { type: Number, default: 0 },
      activeDays: { type: Number, default: 0 },
    },

    trend: { type: Number, enum: numberEnumValues(Trend) },
    momentum: { type: Number, enum: numberEnumValues(Momentum) },
    earlySignal: { type: Number, enum: numberEnumValues(Momentum) },
    regression: { type: RegressionSchema, default: null },
    conversionDropped: { type: Boolean, default: false },
    conversionDropPct: { type: Number, default: 0 },

    abcCurve: { type: Number, enum: numberEnumValues(AbcCurve) },
    abcCumulativePct: { type: Number, default: 0 },
  },
  { _id: false },
);

const MlSalesDashboardSchema = new Schema<ISalesDashboardItem>(
  {
    sku: { type: String, required: true, unique: true, index: true },

    name: String,
    image: String,
    dateCreated: Date,

    // Campos representativos do SKU
    status: String,
    logisticType: String,
    isNew: { type: Boolean, default: false },
    availableQuantity: { type: Number, default: 0 },

    // Valores agregados (soma de todos os produtos do SKU)
    months: { type: [MonthBucketSchema], default: [] },
    totals: {
      units: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },

    dailyAvg45: {
      revenue: { type: Number, default: 0 },
      units: { type: Number, default: 0 },
      activeDays: { type: Number, default: 0 },
    },

    products: { type: [EmbeddedProductSchema], default: [] },

    // Analytics SKU-level (do produto dominante)
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
