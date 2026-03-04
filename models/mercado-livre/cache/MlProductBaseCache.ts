import { IMlProductBase } from "@/types/mercado-livre";
import { IMonthBucket } from "@/types/sales";
import mongoose, { model, models, Schema } from "mongoose";

const MonthBucketSchema = new Schema<IMonthBucket>(
  {
    year: Number,
    month: Number,
    date: Date,
    total: {
      items: Number,
      orders: Number,
      revenue: Number,
    },
    flex: {
      items: Number,
      orders: Number,
      revenue: Number,
    },
    dropOff: {
      items: Number,
      orders: Number,
      revenue: Number,
    },
    fulfillment: {
      items: Number,
      orders: Number,
      revenue: Number,
    },
    views: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
  },
  { _id: false },
);

const MlProductBaseCacheSchema = new Schema<IMlProductBase>(
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
    isNew: Boolean,
    availableQuantity: Number,
    months: { type: [MonthBucketSchema], default: [] },
    dailyAvg45: {
      revenue: { type: Number, default: 0 },
      units: { type: Number, default: 0 },
      activeDays: { type: Number, default: 0 },
    },
    totals: {
      units: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
  },
  { timestamps: true, collection: "productbasecaches" },
);

export const MlProductBaseCache =
  models.MlProductBaseCache ||
  model("ProductBaseCache", MlProductBaseCacheSchema);
