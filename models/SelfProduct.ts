import { ISelfProduct } from "@/types/product";
import { model, models, Schema } from "mongoose";

const SelfProductSchema = new Schema<ISelfProduct>({
  name: { type: String, required: true },
  baseSku: { type: String, required: true, unique: true },

  supplier: {
    type: Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },

  minStockDays: { type: Number, default: 30 },

  stock: {
    storage:  { type: Number, default: 0 }, // Galpão
    incoming: { type: Number, default: 0 }, // A Caminho
    damage:   { type: Number, default: 0 }, // Avaria
  },

  createdAt: { type: Date, default: Date.now },
});

SelfProductSchema.index({ baseSku: 1 });

export const SelfProduct =
  models.InternalProduct || model("InternalProduct", SelfProductSchema);
