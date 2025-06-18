export const calculateFamilyBundleDiscountSchema = {
  name: "calculateFamilyBundleDiscount",
  description: "가족 결합 할인 계산",
  parameters: {
    type: "object",
    properties: {
      planNames: {
        type: "array",
        items: { type: "string" },
        description: "결합할 요금제 이름 리스트",
      },
      planPrices: {
        type: "array",
        items: { type: "number" },
        description: "결합할 요금제 가격 리스트",
      },
    },
  },
};
