import { PipelineStage } from "mongoose";
import { SeriesStages } from "./stages/series.stages";
import { RegressionStages } from "./stages/math/regression.stages";
import { ResidualStages } from "./stages/residual.stages";
import { R2Stages } from "./stages/math/r2.stages";
import { TrendStages } from "./stages/classification/trend.stages";
import { MomentumStages } from "./stages/classification/momentum.stages";
import { EarlySignalStages } from "./stages/classification/early-signal.stages";
import { MetricsStages } from "./stages/math/metrics.stages";
import { ConversionStages } from "./stages/classification/conversion.stages";
import { ConsolidateStages } from "./stages/consolidate.stages";

export class ProductTrendPipelineBuilder {
  private stages: PipelineStage[] = [];

  extractSeries() {
    this.stages.push(SeriesStages.addSeries(), SeriesStages.addRegSeries());
    return this;
  }

  regression() {
    this.stages.push(
      RegressionStages.computeSum(),
      RegressionStages.computeDenominator(),
      RegressionStages.computeSlope(),
      RegressionStages.computeIntercept(),
      RegressionStages.computeSlopePct(),
    );

    return this;
  }

  residualAnalysis() {
    this.stages.push(
      ResidualStages.computeResiduals(),
      ResidualStages.computeStdResidual(),
      R2Stages.compute(),
    );

    return this;
  }

  metrics() {
    this.stages.push(MetricsStages.addMetrics());

    return this;
  }

  classify() {
    this.stages.push(TrendStages.classify(), MomentumStages.classify());

    return this;
  }

  earlySignals() {
    this.stages.push(
      EarlySignalStages.getMonthDays(),
      EarlySignalStages.addProjections(),
      EarlySignalStages.addEarlySignal(),
    );

    return this;
  }

  conversion() {
    this.stages.push(
      ConversionStages.addValidSeries(),
      ConversionStages.calcConversions(),
      ConversionStages.checkIfDropped(),
    );

    return this;
  }

  persist() {
    this.stages.push(ConsolidateStages.project(), ConsolidateStages.persist());

    return this;
  }

  build() {
    return this.stages;
  }
}
