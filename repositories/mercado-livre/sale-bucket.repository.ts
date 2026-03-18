import { MlSalesBucket } from "@/models/mercado-livre/MlSale";

export class SaleBucketRepository {
  async upsertMany(docs: any[]) {
    if (!docs.length) return;

    return MlSalesBucket.bulkWrite(
      docs.map((doc) => {
        const normalizedDate = new Date(doc.date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        return {
          updateOne: {
            filter: {
              product: doc.product,
              date: normalizedDate,
            },
            update: {
              $set: {
                sku: doc.sku,
                unitPrice: doc.unitPrice,
                total: doc.total,
                fulfillment: doc.fulfillment,
                flex: doc.flex,
                dropOff: doc.dropOff,
              },
            },
            upsert: true,
          },
        };
      }),
      { ordered: false },
    );
  }
}
