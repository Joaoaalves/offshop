import { ISelfProduct } from "@/types/product";
import { model, models, Schema } from "mongoose";

const SelfProductSchema = new Schema<ISelfProduct>({
  productType: {
    type: String,
    enum: ["simples", "kit", "combo"],
    default: "simples",
  },

  // Informações básicas
  baseSku: { type: String, required: true, unique: true },
  tinyId: { type: String, sparse: true },
  name: { type: String, required: true },
  imageUrl: { type: String },
  manufacturerCode: { type: String },
  ncm: { type: String, match: /^\d{8}$/ },
  unitsPerBox: { type: Number },

  supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },

  // Pricing
  cost: { type: Number, default: 0 },
  icms: { type: Number },
  ipi: { type: Number },
  difal: { type: Number },
  storageCost: { type: Number },
  priceWithTaxes: { type: Number },   // derived: (cost/unitsPerBox)*(1+(icms+ipi+difal)/100)+storageCost

  // Dimensões e peso
  lengthCm: { type: Number },
  widthCm: { type: Number },
  heightCm: { type: Number },
  volumeM3: { type: Number },
  weightKg: { type: Number },
  chargeableWeightKg: { type: Number },

  minStockDays: { type: Number, default: 30 },

  // Kit
  kitQuantity: { type: Number },
  parentProduct: { type: Schema.Types.ObjectId, ref: "InternalProduct" },

  // Combo
  components: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "InternalProduct",
        required: true,
      },
      quantity: { type: Number, default: 1, required: true },
    },
  ],

  stock: {
    storage: { type: Number, default: 0 },
    incoming: { type: Number, default: 0 },
    fulfillment: { type: Number, default: 0 },
    damage: { type: Number, default: 0 },
  },

  createdAt: { type: Date, default: Date.now },
});

SelfProductSchema.index({ baseSku: 1 });

export const SelfProduct =
  models.InternalProduct || model("InternalProduct", SelfProductSchema);
