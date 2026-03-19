export type PurchaseTrend = "rising" | "falling" | "stable";

export type PurchaseClassification = "discontinuing" | "normal" | "observation";

export interface IPurchaseSalesMetrics {
  total: number;
  dailyAvg: number;
}

export interface IPurchaseStock {
  /** Galpão — InternalProduct.stock.storage */
  storage: number;
  /** A caminho — InternalProduct.stock.incoming */
  incoming: number;
  /** Fulfillment ML — stockcaches.fulfillment.stock */
  fulfillment: number;
}

export interface IPurchaseRestock {
  /** Days of stock remaining at current daily sales rate */
  daysOfCoverage: number;
  /** Suggested order quantity rounded up to nearest unitsPerBox multiple */
  suggestedUnits: number;
}

export interface IPurchaseDashboardItem {
  baseSku: string;
  name: string;
  manufacturerCode?: string;
  supplierName: string;
  supplierLeadTimeDays: number;
  supplierSafetyDays: number;
  cost: number;
  unitsPerBox: number;

  sales30d: IPurchaseSalesMetrics;
  sales15d: IPurchaseSalesMetrics;
  trend: PurchaseTrend;

  stock: IPurchaseStock;
  restock: IPurchaseRestock;

  // ─── Editable optional fields ────────────────────────────────────────────────
  /** Manual classification of this SKU's lifecycle stage */
  classification?: PurchaseClassification;
  /** Planned purchase order quantity — must be a multiple of unitsPerBox */
  order?: number;
  /** Updated unit cost at time of purchase if it has changed */
  newCost?: number;

  updatedAt?: Date;
}
