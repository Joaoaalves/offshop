export const BaseProjection = {
  fields() {
    return {
      sku: 1,
      name: 1,
      image: 1,
      link: 1,
      dateCreated: 1,
      status: 1,
      logisticType: 1,
      isNew: 1,
      stock: 1,
      months: 1,
      totals: 1,
      dailyAvg45: 1,
      dailyAvg30: 1,
      products: 1,
    };
  },
};
