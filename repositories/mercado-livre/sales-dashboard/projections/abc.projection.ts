import { AbcCurve, AbcCurveChange } from "@/types/enums";

export const AbcProjection = {
  fields() {
    return {
      abcCurve: { $ifNull: ["$_abc.abcCurve", AbcCurve.C] },
      abcCumulativePct: { $ifNull: ["$_abc.abcCumulativePct", 0] },
      previousAbcCurve: { $ifNull: ["$_abc.previousAbcCurve", null] },
      abcCurveChange: {
        $ifNull: ["$_abc.abcCurveChange", AbcCurveChange.SAME],
      },
    };
  },
};
