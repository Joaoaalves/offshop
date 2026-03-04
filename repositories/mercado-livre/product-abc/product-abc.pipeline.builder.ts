import { PipelineStage } from "mongoose";
import { BaseStages } from "./stages/base.stages";
import { WindowStages } from "./stages/window.stages";
import { CurveStages } from "./stages/curve.stages";
import { MergeStages } from "./stages/merge.stages";

export class ProductAbcPipelineBuilder {
  private stages: PipelineStage[] = [];

  base() {
    this.stages.push(BaseStages.projectRevenue(), BaseStages.sortByRevenue());
    return this;
  }

  withWindow() {
    this.stages.push(WindowStages.cumulative());
    return this;
  }

  withCurve() {
    this.stages.push(CurveStages.percentage(), CurveStages.classify());
    return this;
  }

  persist() {
    this.stages.push(MergeStages.persist());
    return this;
  }

  build() {
    return this.stages;
  }
}
