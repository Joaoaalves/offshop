import { ISalesBucket } from "@/types/sales";
import { model, models, Schema } from "mongoose";

const SalesBucketSchema = new Schema<ISalesBucket>(
  {
    date: {
      type: Date,
      required: true,
    },

    product: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      required: true,
      index: true,
    },

    unitPrice: {
      type: Number,
      required: true,
    },

    total: {
      items: {
        type: Number,
        required: true,
        default: 0,
      },
      revenue: {
        type: Number,
        required: true,
        default: 0,
      },
      orders: {
        type: Number,
        required: true,
        default: 0,
      },
    },

    fulfillment: {
      items: {
        type: Number,
        required: true,
        default: 0,
      },
      revenue: {
        type: Number,
        required: true,
        default: 0,
      },
      orders: {
        type: Number,
        required: true,
        default: 0,
      },
    },

    flex: {
      items: {
        type: Number,
        required: true,
        default: 0,
      },
      revenue: {
        type: Number,
        required: true,
        default: 0,
      },
      orders: {
        type: Number,
        required: true,
        default: 0,
      },
    },

    // ── Drop-off ──
    dropOff: {
      items: {
        type: Number,
        required: true,
        default: 0,
      },
      revenue: {
        type: Number,
        required: true,
        default: 0,
      },
      orders: {
        type: Number,
        required: true,
        default: 0,
      },
    },
  },
  { timestamps: true },
);

SalesBucketSchema.index({ product: 1, date: 1 }, { unique: true });
SalesBucketSchema.index({ sku: 1, date: 1 });
SalesBucketSchema.index({ date: 1 });
SalesBucketSchema.index({ product: 1 });

export const SalesBucket =
  models.SalesBucket || model("SalesBucket", SalesBucketSchema);
