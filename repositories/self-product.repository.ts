import "@/models/Supplier";
import { SelfProduct } from "@/models/SelfProduct";
import { ISelfProduct } from "@/types/product";

// ─── Calculated fields ────────────────────────────────────────────────────────

function withCalculatedFields<T extends Partial<ISelfProduct>>(product: T): T {
  const { cost, unitsPerBox, priceWithTaxes } = product;

  // unitPrice = cost / unitsPerBox (derived, not stored)
  const unitPrice = cost != null && unitsPerBox ? cost / unitsPerBox : undefined;

  // priceWithTaxes fallback: if not stored, use unitPrice (or cost when no unitsPerBox)
  const resolvedPriceWithTaxes =
    priceWithTaxes ?? unitPrice ?? cost ?? undefined;

  return { ...product, unitPrice, priceWithTaxes: resolvedPriceWithTaxes } as T;
}

// ─── Data mapping ─────────────────────────────────────────────────────────────

/** Maps form's supplierId field → Mongoose's supplier field. */
function mapSupplier(data: any) {
  const { supplierId, ...rest } = data;
  return supplierId ? { ...rest, supplier: supplierId } : rest;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export class SelfProductRepository {
  create(data: any) {
    return SelfProduct.create(mapSupplier(data));
  }

  async findAll(populate: boolean = true) {
    if (!populate) return SelfProduct.find().lean();

    const docs = await SelfProduct.find()
      .populate("supplier")
      .populate("parentProduct")
      .populate({ path: "components.product", populate: { path: "supplier" } })
      .lean();

    return docs.map(withCalculatedFields);
  }

  update(prodId: string, data: any) {
    return SelfProduct.findByIdAndUpdate(prodId, mapSupplier(data), {
      returnDocument: "after",
    });
  }

  delete(prodId: string) {
    return SelfProduct.findByIdAndDelete(prodId);
  }

  findByTinyId(tinyId: string) {
    return SelfProduct.findOne({ tinyId }).lean();
  }

  upsertBySku(baseSku: string, data: Record<string, unknown>) {
    return SelfProduct.findOneAndUpdate(
      { baseSku },
      { $set: data },
      { upsert: true, returnDocument: "after" },
    );
  }

  updateBySku(baseSku: string, data: Record<string, unknown>) {
    return SelfProduct.findOneAndUpdate(
      { baseSku },
      { $set: data },
      { returnDocument: "after" },
    );
  }

  bulkCreate(data: any[]) {
    if (!data.length) return Promise.resolve([]);
    return SelfProduct.insertMany(data.map(mapSupplier), { ordered: false });
  }

  updateStock(
    lines: {
      sku: string;
      storage: number;
      incoming: number;
      damage: number;
      fulfillment: number;
    }[],
  ) {
    if (!lines.length) return;

    return SelfProduct.bulkWrite(
      lines.map(({ sku, storage, incoming, damage, fulfillment }) => ({
        updateOne: {
          filter: { baseSku: sku },
          update: {
            $set: {
              "stock.storage": Math.max(0, storage),
              "stock.incoming": Math.max(0, incoming),
              "stock.damage": Math.max(0, damage),
              "stock.fulfillment": Math.max(0, fulfillment),
            },
          },
        },
      })),
      { ordered: false },
    );
  }
}
