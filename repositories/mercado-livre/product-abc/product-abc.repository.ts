import { ProductBaseCache } from "@/models/mercado-livre/cache/MlProductBaseCache";
import { ProductAbcCache } from "@/models/mercado-livre/cache/MlProductAbc";
import { ProductAbcPipelineBuilder } from "./product-abc.pipeline.builder";
import { AbcCurveChange } from "@/types/enums";

export class ProductAbcCacheRepository {
  async rebuild() {
    const pipeline = new ProductAbcPipelineBuilder()
      .base()
      .withWindow()
      .withCurve()
      .persist()
      .build();

    await ProductBaseCache.aggregate(pipeline, { allowDiskUse: true });
  }

  async getChanged() {
    return ProductAbcCache.find({
      abcCurveChange: { $ne: AbcCurveChange.SAME },
    })
      .sort({ abcCurveChange: -1, abcCurve: -1 })
      .lean();
  }

  async clear() {
    await ProductAbcCache.deleteMany({});
  }
}
