import { Schema, model, models } from "mongoose";

const PurchaseOrderItemSchema = new Schema(
  {
    baseSku: { type: String, required: true },
    manufacturerCode: { type: String },
    quantity: { type: Number, required: true },
    cost: { type: Number, required: true },
  },
  { _id: false },
);

const PurchaseOrderSchema = new Schema(
  {
    supplierName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "arrived"],
      default: "pending",
    },
    orderedAt: { type: Date, required: true },
    arrivedAt: { type: Date },
    leadTimeDays: { type: Number },
    items: { type: [PurchaseOrderItemSchema], default: [] },
  },
  { timestamps: true, collection: "purchaseorders" },
);

export const PurchaseOrder =
  models.PurchaseOrder || model("PurchaseOrder", PurchaseOrderSchema);
