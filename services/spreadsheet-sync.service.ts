// ─── Field remapping (model → spreadsheet) ───────────────────────────────────
// Inverse of the FIELD_REMAP in the ingest endpoint.

const MODEL_TO_SHEET: Record<string, string> = {
  unitsPerBox: "quantityPerBox",
  priceWithTaxes: "finalUnitPrice",
};

// Fields that should never be forwarded to the spreadsheet
const SKIP_FIELDS = new Set([
  "_id",
  "__v",
  "id",
  "tinyId",
  "imageUrl",
  "supplier",
  "parentProduct",
  "components",
  "stock",
  "createdAt",
  "kitQuantity",
]);

// ─── Serialiser ───────────────────────────────────────────────────────────────

function buildPayload(product: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (product.baseSku != null) payload.baseSku = product.baseSku;
  if (product.productType != null) payload.productType = product.productType;

  for (const [key, value] of Object.entries(product)) {
    if (key === "baseSku" || key === "productType") continue;
    if (SKIP_FIELDS.has(key)) continue;
    if (value == null) continue;

    const sheetKey = MODEL_TO_SHEET[key] ?? key;
    payload[sheetKey] = value;
  }

  return payload;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Sends the updated product to the configured spreadsheet webhook as JSON.
 * Fire-and-forget — errors are logged but never thrown to the caller.
 */
export async function syncProductToSpreadsheet(
  product: Record<string, unknown>,
): Promise<void> {
  const url = process.env.SPREADSHEET_URL;
  if (!url) {
    console.warn("[spreadsheet-sync] SPREADSHEET_URL not set, skipping sync.");
    return;
  }

  const payload = buildPayload(product);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(
        `[spreadsheet-sync] Webhook returned ${res.status}: ${await res.text()}`,
      );
    } else {
      console.log(`[spreadsheet-sync] Synced ${payload.baseSku} — ${res.status}`);
    }
  } catch (err) {
    console.error(
      "[spreadsheet-sync] Failed to reach spreadsheet webhook:",
      err,
    );
  }
}
