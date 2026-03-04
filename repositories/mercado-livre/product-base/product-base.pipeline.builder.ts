import { PipelineStage } from "mongoose";
import { BaseStages } from "./stages/base.stages";
import { ViewsStages } from "./stages/views.stages";
import { SalesStages } from "./stages/sales.stages";
import { MonthsStages } from "./stages/months.stages";
import { TotalsStages } from "./stages/totals.stages";
import { ConsolidateStages } from "./stages/consolidate.stages";

export class ProductBasePipelineBuilder {
  private stages: PipelineStage[] = [];

  base() {
    this.stages.push(BaseStages.matchValid());
    return this;
  }

  withViews(start: Date, end: Date) {
    this.stages.push(ViewsStages.lookup(start, end));
    return this;
  }

  withMonthlySales(start: Date, end: Date) {
    this.stages.push(SalesStages.lookup(start, end));
    return this;
  }

  buildMonths() {
    this.stages.push(
      ...MonthsStages.mapViewSales(),
      MonthsStages.buildMonths(),
      MonthsStages.addConversionToMonths(),
    );

    return this;
  }

  withTotals() {
    this.stages.push(TotalsStages.lookup(), TotalsStages.compute());
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
