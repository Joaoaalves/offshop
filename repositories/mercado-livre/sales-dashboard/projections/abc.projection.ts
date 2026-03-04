import { AbcCurve, AbcCurveChange } from "@/types/enums";

export const AbcProjection = {
  fields() {
    return {
      abcCurve: { $ifNull: ["$_abc.abcCurve", AbcCurve.C] },
      abcCumulativePct: { $ifNull: ["$_abc.abcCumulativePct", 0] },
    };
  },
};
