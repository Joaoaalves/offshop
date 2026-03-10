import "@/models/Supplier";
import { SelfProduct } from "@/models/SelfProduct";

export class SelfProductRepository {
  create(data: any) {
    return SelfProduct.create(data);
  }

  findAll(populate: boolean = true) {
    if (populate) return SelfProduct.find().populate("supplier").lean();

    return SelfProduct.find().lean();
  }

  update(prodId: string, data: any) {
    return SelfProduct.findByIdAndUpdate(prodId, data, {
      new: true,
    });
  }

  delete(prodId: string) {
    return SelfProduct.findByIdAndDelete(prodId);
  }

  updateStock(lines: { sku: string; storage: number; incoming: number; damage: number }[]) {
    if (!lines.length) return;

    return SelfProduct.bulkWrite(
      lines.map(({ sku, storage, incoming, damage }) => ({
        updateOne: {
          filter: { baseSku: sku },
          update: {
            $set: {
              "stock.storage":  storage,
              "stock.incoming": incoming,
              "stock.damage":   damage,
            },
          },
        },
      })),
      { ordered: false },
    );
  }
}
