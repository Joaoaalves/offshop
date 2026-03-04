import { IExternalProduct, IProductBaseCache } from "./product";

export type MlLogisticType =
  | "fulfillment"
  | "self-service"
  | "drop-off"
  | "xd-drop-off";

export type MlProductStatus = "active" | "paused" | "under_review";

export interface IMlProduct extends IExternalProduct<
  MlLogisticType,
  MlProductStatus
> {
  catalogListing: boolean; // If true, is a catalog item
  itemRelation?: string; // Another productId
}

export type IMlProductBase = IProductBaseCache<IMlProduct>;
