import { TinyClient, TinyPlan } from "tiny-erp-client";
import { SelfProduct } from "@/models/SelfProduct";

function getTinyClient(): TinyClient | null {
  const token = process.env.TINY_TOKEN;
  if (!token) return null;
  const plan = (process.env.TINY_PLAN ?? "Evoluir") as TinyPlan;
  return new TinyClient({ token, plan });
}

/**
 * Adds ordered quantities to Tiny ERP stock (movementType: 'entry') for each
 * item. Products without a tinyId are skipped silently.
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

  const products = await SelfProduct.find(
    { baseSku: { $in: items.map((i) => i.baseSku) } },
    { baseSku: 1, tinyId: 1 },
  ).lean();

  const tinyIdByBaseSku = new Map(
    products
      .filter((p) => p.tinyId)
      .map((p) => [p.baseSku, p.tinyId as string]),
  );

  await Promise.allSettled(
    items.map(async ({ baseSku, quantity }) => {
      const productId = tinyIdByBaseSku.get(baseSku);
      if (!productId) return; // no tinyId — skip

      try {
        await client.products.updateStock({
          productId,
          quantity,
          movementType: "entry",
          warehouse: "A caminho",
        });
      } catch (err) {
        console.error(
          `[tiny-stock-sync] Failed to update stock for ${baseSku} (tinyId: ${productId}):`,
          err,
        );
      }
    }),
  );
}
