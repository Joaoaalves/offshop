import { IProductView } from "@/types/views";
import { model, models, Schema } from "mongoose";

const ProductViewSchema = new Schema<IProductView>({
  productId: { type: String, required: true },
  date: { type: Date, required: true },
  views: { type: Number, default: 0, required: true },
});

ProductViewSchema.index({
  productId: 1,
  date: 1,
});

ProductViewSchema.index({ productId: 1, date: 1 }, { unique: true });

export const ProductView =
  models.MlProductView || model("mlViews", ProductViewSchema);
