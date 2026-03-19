export type PurchaseOrderStatus = "pending" | "arrived";

export interface IPurchaseOrderItem {
  baseSku: string;
  manufacturerCode?: string;
  quantity: number;
  cost: number;
}

export interface IPurchaseOrder {
  _id: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  orderedAt: string;
  arrivedAt?: string;
  leadTimeDays?: number;
  items: IPurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}
