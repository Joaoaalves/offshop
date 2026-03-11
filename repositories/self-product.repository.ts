import "@/models/Supplier";
import { SelfProduct } from "@/models/SelfProduct";
import { ISelfProduct } from "@/types/product";

function withCalculatedFields<T extends Partial<ISelfProduct>>(product: T): T {
  const { tablePrice, icms = 0, ipi = 0, difal = 0, unitsPerBox } = product;
  if (tablePrice == null) return product;
  const priceWithTaxes = tablePrice * (1 + (icms + ipi + difal) / 100);
  const unitPrice = unitsPerBox ? priceWithTaxes / unitsPerBox : undefined;
  return { ...product, priceWithTaxes, unitPrice };
}

export class SelfProductRepository {
  create(data: any) {
    return SelfProduct.create(data);
  }

  async findAll(populate: boolean = true) {
    const docs = populate
      ? await SelfProduct.find().populate("supplier").lean()
      : await SelfProduct.find().lean();
    return docs.map(withCalculatedFields);
  }

  update(prodId: string, data: any) {
    return SelfProduct.findByIdAndUpdate(prodId, data, {
      new: true,
    });
  }

  delete(prodId: string) {
    return SelfProduct.findByIdAndDelete(prodId);
  }

  bulkCreate(data: any[]) {
    if (!data.length) return Promise.resolve([]);
    return SelfProduct.insertMany(data, { ordered: false });
  }

  updateStock(
    lines: { sku: string; storage: number; incoming: number; damage: number }[],
  ) {
    if (!lines.length) return;

    return SelfProduct.bulkWrite(
      lines.map(({ sku, storage, incoming, damage }) => ({
        updateOne: {
          filter: { baseSku: sku },
          update: {
            $set: {
              "stock.storage": Math.max(0, storage),
              "stock.incoming": Math.max(0, incoming),
              "stock.damage": Math.max(0, damage),
            },
          },
        },
      })),
      { ordered: false },
    );
  }
}
