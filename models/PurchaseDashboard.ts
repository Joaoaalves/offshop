import { IPurchaseDashboardItem } from "@/types/purchases";
import { model, models, Schema } from "mongoose";

const salesMetricsSchema = {
  total: { type: Number, default: 0 },
  dailyAvg: { type: Number, default: 0 },
};

const PurchaseDashboardSchema = new Schema<IPurchaseDashboardItem>(
  {
    baseSku: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    manufacturerCode: { type: String },
    supplierName: { type: String, default: "Sem Fornecedor" },
    supplierLeadTimeDays: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    unitsPerBox: { type: Number, default: 1 },

    sales30d: { type: salesMetricsSchema, default: () => ({ total: 0, dailyAvg: 0 }) },
    sales15d: { type: salesMetricsSchema, default: () => ({ total: 0, dailyAvg: 0 }) },
    trend: {
      type: String,
      enum: ["rising", "falling", "stable"],
      default: "stable",
    },

    stock: {
      storage: { type: Number, default: 0 },
      incoming: { type: Number, default: 0 },
      fulfillment: { type: Number, default: 0 },
    },

    restock: {
      daysOfCoverage: { type: Number, default: 0 },
      suggestedUnits: { type: Number, default: 0 },
    },

    // ─── Editable fields — preserved across rebuilds ─────────────────────────
    classification: {
      type: String,
      enum: ["discontinuing", "normal", "observation"],
    },
    order: { type: Number },
    newCost: { type: Number },
  },
  { timestamps: true },
);

PurchaseDashboardSchema.index({ baseSku: 1 });

export const PurchaseDashboard =
  models.PurchaseDashboard ||
  model<IPurchaseDashboardItem>("PurchaseDashboard", PurchaseDashboardSchema);
