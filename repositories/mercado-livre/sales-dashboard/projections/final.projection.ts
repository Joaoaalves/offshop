import { PipelineStage } from "mongoose";
import { BaseProjection } from "./base.projection";
import { TrendProjection } from "./trend.projection";
import { AbcProjection } from "./abc.projection";
import { StockProjection } from "./stock.projection";

export const FinalProjection = {
  build(): PipelineStage.Project {
    return {
      $project: {
        _id: 0,
        ...BaseProjection.fields(),
        ...TrendProjection.fields(),
        ...AbcProjection.fields(),
        ...StockProjection.fields(),
      },
    };
  },
};
