import { IProductAbc } from "@/types/abc";
import { AbcCurve } from "@/types/enums";
import mongoose, { Schema } from "mongoose";

const MlProductAbcSchema = new Schema<IProductAbc>(
  {
    productId: { type: String, required: true, unique: true, index: true },

    totalRevenue: { type: Number, default: 0 },
    cumulativeRevenue: { type: Number, default: 0 },
    grandTotalRevenue: { type: Number, default: 0 },
    abcCumulativePct: { type: Number, default: 0 },

    abcCurve: {
      type: Number,
      enum: Object.values(AbcCurve).filter((v) => typeof v === "number"),
      required: true,
    },
  },
  { timestamps: true, collection: "productabccaches" },
);

export const ProductAbcCache = mongoose.model<IProductAbc>(
  "ProductAbcCache",
  MlProductAbcSchema,
);
