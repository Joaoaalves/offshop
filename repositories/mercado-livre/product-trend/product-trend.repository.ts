import { ProductBaseCache } from "@/models/mercado-livre/cache/MlProductBaseCache";
import { ProductTrendPipelineBuilder } from "./product-trend.pipeline.builder";

export class ProductTrendRepository {
  async rebuild() {
    const pipeline = new ProductTrendPipelineBuilder()
      .extractSeries()
      .regression()
      .residualAnalysis()
      .metrics()
      .classify()
      .earlySignals()
      .conversion()
      .persist()
      .build();

    return ProductBaseCache.aggregate(pipeline, {
      allowDiskUse: true,
    });
  }
}
