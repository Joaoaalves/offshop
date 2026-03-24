import { requireIngestToken } from "@/lib/ingest-guard";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";

// ─── Field mapping (spreadsheet name → model name) ───────────────────────────

const FIELD_REMAP: Record<string, string> = {
  quantityPerBox: "unitsPerBox",
  finalUnitPrice: "unitPrice",
};

const NUMERIC_FIELDS = new Set([
  "widthCm",
  "heightCm",
  "lengthCm",
  "weightKg",
  "chargeableWeightKg",
  "volumeM3",
  "ipi",
  "icms",
  "difal",
  "storageCost",
  "cost",
  "tablePrice",
  "unitPrice",
  "unitsPerBox",
  "minStockDays",
  "kitQuantity",
  // spreadsheet aliases (resolved before lookup)
  "quantityPerBox",
  "finalUnitPrice",
]);

// Fields sent by the spreadsheet that don't map to any model field
const IGNORE_FIELDS = new Set<string>([]);

// ─── Payload parser ───────────────────────────────────────────────────────────

/**
 * Parses the custom `{key=value, key=value}` format sent by Google Sheets.
 * Splits on `, ` only when the next token matches `word=` so that values
 * containing spaces (e.g. product names) are preserved.
 */
function parseSheetObject(text: string): Record<string, string> {
  const inner = text.trim().replace(/^\{/, "").replace(/\}$/, "");
  const result: Record<string, string> = {};

  // Split at boundaries where ", " is followed by an identifier and "="
  const pairs = inner.split(/,\s*(?=\w+=)/);

  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const key = pair.slice(0, eqIdx).trim();
    const val = pair.slice(eqIdx + 1).trim();
    if (key) result[key] = val;
  }

  return result;
}

function parseBody(text: string): Record<string, unknown>[] {
  const trimmed = text.trim();

  // JSON (primary format sent by Apps Script)
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // fall through to custom format
  }

  // Legacy {key=value} format — single object or array of objects
  if (trimmed.startsWith("[")) {
    const inner = trimmed.slice(1, -1).trim();
    const objectTexts = inner.match(/\{[^}]*\}/g) ?? [];
    return objectTexts.map(parseSheetObject);
  }

  if (trimmed.startsWith("{")) {
    return [parseSheetObject(trimmed)];
  }

  return [];
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function toNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "number") return isNaN(val) ? null : val;
  // String fallback — handles "17,5" (comma decimal) and scientific notation
  const str = String(val).trim().replace(",", ".");
  if (str === "" || str === "null") return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function mapRow(
  raw: Record<string, unknown>,
): { baseSku: string; data: Record<string, unknown> } | null {
  const baseSku = String(raw.baseSku ?? "").trim();
  if (!baseSku) return null;

  const data: Record<string, unknown> = {};

  for (const [rawKey, rawVal] of Object.entries(raw)) {
    if (rawKey === "baseSku") continue;

    const modelKey = FIELD_REMAP[rawKey] ?? rawKey;
    if (IGNORE_FIELDS.has(modelKey)) continue;

    let value: unknown = rawVal;

    if (NUMERIC_FIELDS.has(rawKey)) {
      value = toNumber(rawVal);
    }

    // Normalise NCM: "3924.90.00" → "39249000"
    if (modelKey === "ncm" && typeof value === "string") {
      value = value.replace(/\D/g, "");
    }

    data[modelKey] = value;
  }

  return { baseSku, data };
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const deny = await requireIngestToken(req);
  if (deny) return deny;

  await connectDB();

  const bodyText = await req.text();
  const rawRows = parseBody(bodyText);

  if (!rawRows.length) {
    return NextResponse.json(
      { error: "Corpo da requisição inválido ou vazio." },
      { status: 400 },
    );
  }

  const repo = new SelfProductRepository();

  const results = {
    updated: 0,
    notFound: [] as string[],
    errors: [] as { baseSku: string; error: string }[],
  };

  for (const raw of rawRows) {
    const mapped = mapRow(raw);

    console.log(mapped?.data);
    if (!mapped) {
      results.errors.push({
        baseSku: "(desconhecido)",
        error: "baseSku ausente",
      });
      continue;
    }

    try {
      const updated = await repo.updateBySku(mapped.baseSku, mapped.data);

      if (!updated) {
        results.notFound.push(mapped.baseSku);
      } else {
        results.updated++;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.errors.push({ baseSku: mapped.baseSku, error: msg });
    }
  }

  const status = results.errors.length > 0 && results.updated === 0 ? 500 : 200;

  return NextResponse.json(results, { status });
}
