import { MlProductBaseCache } from "@/models/mercado-livre/cache/MlProductBaseCache";
import { SalesDashboardPipelineBuilder } from "./sales-dashboard.pipeline.builder";
import { MlSalesDashboard } from "@/models/mercado-livre/MlSalesDashboard";

export class MlSalesDashboardRepository {
  async rebuild() {
    const pipeline = new SalesDashboardPipelineBuilder()
      .joins()
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
