export function calculateFamilyBundle(prices) {
  const phoneCount = prices.length;
  const discounts = prices.map((price) => {
    if (phoneCount >= 4) {
      if (price >= 88000) return 8800;
      if (price >= 69000) return 6600;
      return 4400;
    }
    if (phoneCount === 3) {
      if (price >= 88000) return 6600;
      if (price >= 69000) return 5500;
      return 3300;
    }
    if (phoneCount === 2) {
      if (price >= 88000) return 4400;
      if (price >= 69000) return 3300;
      return 2200;
    }
    return 0;
  });

  const total = discounts.reduce((sum, d) => sum + d, 0);
  return { phoneCount, discounts, totalDiscount: total };
}
