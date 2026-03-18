import { IMlSaleBucket } from "@/types/sales";
import { model, models, Schema } from "mongoose";

const MlSaleBucketSchema = new Schema<IMlSaleBucket>(
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

MlSaleBucketSchema.index({ product: 1, date: 1 }, { unique: true });
MlSaleBucketSchema.index({ sku: 1, date: 1 });
MlSaleBucketSchema.index({ date: 1 });
MlSaleBucketSchema.index({ product: 1 });

export const MlSalesBucket =
  models.SalesBucket || model("SalesBucket", MlSaleBucketSchema);
