/** Returns the segment after the last "-" in a SKU string. */
function lastSegment(sku: string): string {
  return sku.split("-").pop() ?? sku;
}

/** Kit SKU: `{quantity}U-{parentSku}` */
export function generateKitSku(parentSku: string, quantity: number): string {
  return `${quantity}U-${parentSku}`;
}

/** Combo SKU: `COM-{lastSegment(sku1)}-{lastSegment(sku2)}-...` */
export function generateComboSku(componentSkus: string[]): string {
  return `COM-${componentSkus.map(lastSegment).join("-")}`;
}
