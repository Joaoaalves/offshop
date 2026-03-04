import { Momentum, Trend } from "@/types/enums";
import { IModalityTrend, IProductTrendCache } from "@/types/trend";
import mongoose, { Schema } from "mongoose";

const ModalityTrendSchema = new Schema<IModalityTrend>(
  {
    trend: {
      type: Number,
      enum: Object.values(Trend).filter((v) => typeof v === "number"),
      default: Trend.INSUFICIENT,
    },
    momentum: {
      type: Number,
      enum: Object.values(Momentum).filter((v) => typeof v === "number"),
      default: Momentum.STABLE,
    },
    earlySignal: {
      type: Number,
      enum: [
        ...Object.values(Momentum).filter((v) => typeof v === "number"),
        null,
      ],
      default: null,
    },
    regression: {
      slope: { type: Number, default: 0 },
      intercept: { type: Number, default: 0 },
      r2: { type: Number, default: 0 },
      slopePct: { type: Number, default: 0 },
      avgRevenue: { type: Number, default: 0 },
    },
  },
  { _id: false },
);

const MlProductTrendSchema = new Schema<IProductTrendCache>(
  {
    productId: { type: String, required: true, unique: true, index: true },

    revenueSeries: [Number],
    conversionSeries: [Number],

    trend: {
      type: Number,
      enum: Object.values(Trend).filter((v) => typeof v === "number"),
      required: true,
    },
    momentum: {
      type: Number,
      enum: Object.values(Momentum).filter((v) => typeof v === "number"),
      required: true,
    },
    earlySignal: {
      type: Number,
      enum: Object.values(Momentum).filter((v) => typeof v === "number"),
    },
    regression: {
      slope: { type: Number, default: 0 },
      intercept: { type: Number, default: 0 },
      r2: { type: Number, default: 0 },
      slopePct: { type: Number, default: 0 },
      avgRevenue: { type: Number, default: 0 },
    },

    conversionDropped: { type: Boolean, default: false },
    conversionDropPct: { type: Number, default: 0 },

    fulfillment: { type: ModalityTrendSchema, default: () => ({}) },
    flex: { type: ModalityTrendSchema, default: () => ({}) },
  },
  { timestamps: true, collection: "producttrendcaches" },
);

export const MlProductTrend = mongoose.model<IProductTrendCache>(
  "ProductTrendCache",
  MlProductTrendSchema,
);
