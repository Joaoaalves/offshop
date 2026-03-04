import { PipelineStage } from "mongoose";
import { TrendJoin } from "./joins/trend.join";
import { AbcJoin } from "./joins/abc.join";
import { StockJoin } from "./joins/stock.joinl";
import { FinalProjection } from "./projections/final.projection";
import { MergeStage } from "./stages/merge.stage";

export class SalesDashboardPipelineBuilder {
  private stages: PipelineStage[] = [];

  joins() {
    this.stages.push(
      ...TrendJoin.lookup(),
      ...AbcJoin.lookup(),
      ...StockJoin.lookup(),
    );
    return this;
  }

  project() {
    this.stages.push(FinalProjection.build());
    return this;
  }

  sort() {
    this.stages.push({ $sort: { dateCreated: 1 } });
    return this;
  }

  persist() {
    this.stages.push(MergeStage.merge());
    return this;
  }

  build() {
    return this.stages;
  }
}
