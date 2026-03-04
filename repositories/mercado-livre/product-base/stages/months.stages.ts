import { PipelineStage } from "mongoose";

export const MonthsStages = {
  mapViewSales(): PipelineStage.AddFields[] {
    return [
      {
        $addFields: {
          _viewDates: {
            $map: {
              input: "$viewsByMonth",
              as: "v",
              in: { $dateTrunc: { date: "$$v._id", unit: "month" } },
            },
          },
          _salesDates: {
            $map: {
              input: "$salesByMonth",
              as: "s",
              in: { $dateTrunc: { date: "$$s._id", unit: "month" } },
            },
          },
        },
      },
      {
        $addFields: {
          _allDates: { $setUnion: ["$_viewDates", "$_salesDates"] },
        },
      },
    ];
  },

  buildMonths(): PipelineStage {
    return {
      $addFields: {
        months: {
          $sortArray: {
            input: {
              $map: {
                input: "$_allDates",
                as: "d",
                in: {
                  date: "$$d",
                  year: { $year: "$$d" },
                  month: { $month: "$$d" },

                  views: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          {
                            $map: {
                              input: {
                                $filter: {
                                  input: "$viewsByMonth",
                                  as: "v",
                                  cond: {
                                    $eq: [
                                      {
                                        $dateTrunc: {
                                          date: "$$v._id",
                                          unit: "month",
                                        },
                                      },
                                      "$$d",
                                    ],
                                  },
                                },
                              },
                              as: "v",
                              in: "$$v.views",
                            },
                          },
                          0,
                        ],
                      },
                      0,
                    ],
                  },

                  // ── Macro para extrair um campo de salesByMonth ──────────
                  // (repetido por campo pois o MongoDB não tem variável local)

                  total: {
                    items: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.totalItems",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                    revenue: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.totalRevenue",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                    orders: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.totalOrders",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                  },

                  fulfillment: {
                    items: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.fulfillmentItems",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                    revenue: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.fulfillmentRevenue",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                    orders: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.fulfillmentOrders",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                  },

                  flex: {
                    items: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.flexItems",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                    revenue: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.flexRevenue",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                    orders: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.flexOrders",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                  },

                  dropOff: {
                    items: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.dropOffItems",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                    revenue: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.dropOffRevenue",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                    orders: {
                      $ifNull: [
                        {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$salesByMonth",
                                    as: "s",
                                    cond: {
                                      $eq: [
                                        {
                                          $dateTrunc: {
                                            date: "$$s._id",
                                            unit: "month",
                                          },
                                        },
                                        "$$d",
                                      ],
                                    },
                                  },
                                },
                                as: "s",
                                in: "$$s.dropOffOrders",
                              },
                            },
                            0,
                          ],
                        },
                        0,
                      ],
                    },
                  },
                },
              },
            },
            sortBy: { date: 1 },
          },
        },
      },
    };
  },

  addConversionToMonths(): PipelineStage.AddFields {
    return {
      $addFields: {
        months: {
          $map: {
            input: "$months",
            as: "m",
            in: {
              date: "$$m.date",
              year: "$$m.year",
              month: "$$m.month",
              views: "$$m.views",
              total: "$$m.total",
              fulfillment: "$$m.fulfillment",
              flex: "$$m.flex",
              dropOff: "$$m.dropOff",
              conversionRate: {
                $cond: {
                  if: { $gt: ["$$m.views", 0] },
                  then: {
                    $min: [{ $divide: ["$$m.total.orders", "$$m.views"] }, 100],
                  },
                  else: 0,
                },
              },
            },
          },
        },
      },
    };
  },
};
