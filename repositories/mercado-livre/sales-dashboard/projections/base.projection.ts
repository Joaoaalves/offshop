export const BaseProjection = {
  fields() {
    return {
      sku: 1,
      name: 1,
      image: 1,
      dateCreated: 1,
      status: 1,
      logisticType: 1,
      isNew: 1,
      availableQuantity: 1,
      months: 1,
      totals: 1,
      dailyAvg45: 1,
      products: 1,
    };
  },
};