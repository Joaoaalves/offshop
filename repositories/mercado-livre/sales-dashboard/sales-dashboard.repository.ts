import { MlProductBaseCache } from "@/models/mercado-livre/cache/MlProductBaseCache";
import { SalesDashboardPipelineBuilder } from "./sales-dashboard.pipeline.builder";
import { MlSalesDashboard } from "@/models/mercado-livre/MlSalesDashboard";

export class MlSalesDashboardRepository {
  async rebuild() {
    // Garante que o índice único em `sku` exista antes do $merge
    await MlSalesDashboard.syncIndexes();

    const pipeline = new SalesDashboardPipelineBuilder()
      .filter()
      .joins()
      .groupBySku()
      .stockJoin()
      .project()
      .sort()
      .persist()
      .build();

    return MlProductBaseCache.aggregate(pipeline, {
      allowDiskUse: true,
    });
  }

  async getAll() {
    return await MlSalesDashboard.find().lean();
  }

  async clear() {
    await MlSalesDashboard.deleteMany({});
  }
}
