import { TinyClient, TinyPlan } from "tiny-erp-client";
import { SelfProduct } from "@/models/SelfProduct";

function getTinyClient(): TinyClient | null {
  const token = process.env.TINY_TOKEN;
  if (!token) return null;
  const plan = (process.env.TINY_PLAN ?? "Evoluir") as TinyPlan;
  return new TinyClient({ token, plan });
}

async function resolveTinyIds(
  baseSkus: string[],
): Promise<Map<string, string>> {
  const products = await SelfProduct.find(
    { baseSku: { $in: baseSkus } },
    { baseSku: 1, tinyId: 1 },
  ).lean();
  return new Map(
    products
      .filter((p) => p.tinyId)
      .map((p) => [p.baseSku, p.tinyId as string]),
  );
}

/**
 * Registers a stock entry in the "A caminho" deposit in Tiny ERP for each
 * ordered item. Products without a tinyId are skipped silently.
 *
 * Never throws — errors are logged so the caller is never blocked.
 */
export async function syncOrderToTinyStock(
  items: { baseSku: string; quantity: number }[],
): Promise<void> {
  const client = getTinyClient();
  if (!client) {
    console.warn("[tiny-stock-sync] TINY_TOKEN not set — skipping Tiny sync");
    return;
  }

  const tinyIdByBaseSku = await resolveTinyIds(items.map((i) => i.baseSku));

  await Promise.allSettled(
    items.map(async ({ baseSku, quantity }) => {
      const productId = tinyIdByBaseSku.get(baseSku);
      if (!productId) return;

      try {
        await client.products.updateStock({
          productId,
          quantity,
          movementType: "entry",
          warehouse: "A caminho",
        });
      } catch (err) {
        console.error(
          `[tiny-stock-sync] syncOrderToTinyStock failed for ${baseSku}:`,
          err,
        );
      }
    }),
  );
}

/**
 * Transfers stock from "A caminho" → "Galpão" in Tiny ERP when a purchase
 * order is marked as arrived. Two movements per product: exit from "A caminho"
 * and entry to "Galpão".
 *
 * Never throws — errors are logged so the caller is never blocked.
 */
export async function syncArrivalToTinyStock(
  items: { baseSku: string; quantity: number }[],
): Promise<void> {
  const client = getTinyClient();
  if (!client) {
    console.warn("[tiny-stock-sync] TINY_TOKEN not set — skipping Tiny sync");
    return;
  }

  const tinyIdByBaseSku = await resolveTinyIds(items.map((i) => i.baseSku));

  await Promise.allSettled(
    items.map(async ({ baseSku, quantity }) => {
      const productId = tinyIdByBaseSku.get(baseSku);
      if (!productId) return;

      try {
        // Remove from "A caminho"
        await client.products.updateStock({
          productId,
          quantity,
          movementType: "exit",
          warehouse: "A caminho",
        });
        // Add to "Galpão"
        await client.products.updateStock({
          productId,
          quantity,
          movementType: "entry",
          warehouse: "Galpão",
        });
      } catch (err) {
        console.error(
          `[tiny-stock-sync] syncArrivalToTinyStock failed for ${baseSku}:`,
          err,
        );
      }
    }),
  );
}
