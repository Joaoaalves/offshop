import { MlProduct } from "@/models/mercado-livre/MlProduct";
import { ProductView } from "@/models/ProductView";

export class MlProductRepository {
  async upsertMany(products: any[]) {
    if (!products.length) return;

    return MlProduct.bulkWrite(
      products.map((product) => ({
        updateOne: {
          filter: { productId: product.productId },
          update: {
            $set: {
              sku: product.sku,
              unitsPerPack: product.unitsPerPack,
              name: product.name,
              image: product.image,
              link: product.permalink,
              price: product.price,
              catalogListing: product.catalogListing,
              availableQuantity: product.availableQuantity,
              logisticType: product.logisticType,
              itemRelation: product.itemRelation,
              dateCreated: product.dateCreated,
              status: product.status,
              inventoryId: product.inventoryId,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  async insertManyViews(views: any[]) {
    if (!views.length) return;

    return ProductView.bulkWrite(
      views.map((view) => ({
        updateOne: {
          filter: {
            productId: view.productId,
            date: new Date(view.date),
          },
          update: {
            $set: {
              views: view.views,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  async updateFlexStock(lines: { sku: string; availableQuantity: number }[]) {
    if (!lines.length) return;

    return MlProduct.bulkWrite(
      lines.map(({ sku, availableQuantity }) => ({
        updateMany: {
          filter: { sku, logisticType: "xd_drop_off" },
          update: { $set: { availableQuantity } },
        },
      })),
      { ordered: false },
    );
  }

  async get(productId?: string) {
    return MlProduct.find(productId ? { productId } : {});
  }
}
