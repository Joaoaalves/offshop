import "@/models/PurchaseDashboard";
import "@/models/Supplier";
import { SelfProduct } from "@/models/SelfProduct";
import { SelfProductRepository } from "@/repositories/self-product.repository";
import { PurchaseDashboard } from "@/models/PurchaseDashboard";
import { PurchasesPipelineBuilder } from "./purchases.pipeline.builder";
import { PurchaseClassification } from "@/types/purchases";
import { syncProductToSpreadsheet } from "@/services/spreadsheet-sync.service";

export class PurchasesRepository {
  async rebuild() {
    const pipeline = new PurchasesPipelineBuilder()
      .matchSimples()
      .withSupplier()
      .withSales()
      .withStock()
      .withTrend()
      .withRestock()
      .persist()
      .build();
    await SelfProduct.aggregate(pipeline);
  }

  /** Returns all purchase dashboard items sorted by supplier then baseSku */
  async getAll() {
    return PurchaseDashboard.find({})
      .sort({ supplierName: 1, baseSku: 1 })
      .lean();
  }

  /**
   * Updates a single editable field (classification, order, newCost).
   * Editable fields are preserved across rebuilds.
   */
  async updateEditableField(
    baseSku: string,
    field: "classification" | "order" | "newCost",
    value: PurchaseClassification | number | null,
  ) {
    return PurchaseDashboard.findOneAndUpdate(
      { baseSku },
      value == null ? { $unset: { [field]: 1 } } : { $set: { [field]: value } },
      { returnDocument: "after" },
    );
  }

  /**
   * Syncs newCost → SelfProduct.cost for all items where newCost differs from cost.
   * Triggers the spreadsheet sync for each updated product.
   * Clears newCost from the purchases dashboard after a successful update.
   */
  async syncCosts() {
    const items = await PurchaseDashboard.find({
      newCost: { $exists: true, $ne: null },
      $expr: { $ne: ["$newCost", "$cost"] },
    }).lean();

    const selfProductRepo = new SelfProductRepository();
    const results: { baseSku: string; ok: boolean; error?: string }[] = [];

    for (const item of items) {
      try {
        const updated = await selfProductRepo.updateBySku(item.baseSku, {
          cost: item.newCost,
        });
        if (updated) {
          syncProductToSpreadsheet(updated.toObject()).catch(() => void 0);
          await PurchaseDashboard.updateOne(
            { baseSku: item.baseSku },
            { $unset: { newCost: 1 }, $set: { cost: item.newCost } },
          );
        }
        results.push({ baseSku: item.baseSku, ok: true });
      } catch (e: unknown) {
        results.push({
          baseSku: item.baseSku,
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return results;
  }
}
