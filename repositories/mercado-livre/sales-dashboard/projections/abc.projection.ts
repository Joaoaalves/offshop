import { AbcCurve } from "@/types/enums";

export const AbcProjection = {
  fields() {
    return {
      abcCurve: { $ifNull: ["$abcCurve", AbcCurve.C] },
      abcCumulativePct: { $ifNull: ["$abcCumulativePct", 0] },
    };
  },
};
