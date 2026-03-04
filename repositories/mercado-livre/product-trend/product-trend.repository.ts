import { MlProductBaseCache } from "@/models/mercado-livre/cache/MlProductBaseCache";
import { ProductTrendPipelineBuilder } from "./product-trend.pipeline.builder";
import { MlProductTrend } from "@/models/mercado-livre/cache/MlProductTrend";

export class MlProductTrendRepository {
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

    return MlProductBaseCache.aggregate(pipeline, {
      allowDiskUse: true,
    });
  }

  async clear() {
    await MlProductTrend.deleteMany({});
  }
}
