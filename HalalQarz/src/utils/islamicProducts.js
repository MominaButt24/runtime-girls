// HalalQarz - islamicProducts.js
export const MURABAHA = {
  id: "murabaha",
  name: "Murabaha",
  nameUrdu: "مرابحہ",
  icon: "🏪",
  // ✅ Removed "vehicle" — that belongs to Ijara
  purposeMatches: ["home appliances", "goods", "other"],
  description: "Bank buys asset, sells at fixed agreed price",
  banks: ["Meezan Bank", "Bank Islami", "HBL Islamic"],
};

export const DIMINISHING_MUSHARAKA = {
  id: "diminishing-musharaka",
  name: "Diminishing Musharaka",
  nameUrdu: "مشارکہ",
  icon: "🏠",
  purposeMatches: ["home", "property", "house"],
  description: "Co-ownership with bank, gradually buy bank share",
  banks: ["Meezan Bank", "Dubai Islamic Bank", "MCB Islamic"],
};

export const MUDARABA = {
  id: "mudaraba",
  name: "Mudaraba",
  nameUrdu: "مضاربہ",
  icon: "💼",
  purposeMatches: ["business", "startup", "trade"],
  description: "Bank funds, profit shared by agreement",
  banks: ["Bank Islami", "Meezan Bank", "UBL Ameen"],
};

export const IJARA = {
  id: "ijara",
  name: "Ijara",
  nameUrdu: "اجارہ",
  icon: "🚗",
  // ✅ Vehicle correctly stays here only
  purposeMatches: ["vehicle", "car", "equipment", "machinery"],
  description: "Islamic leasing, pay rental, no debt",
  banks: ["Meezan Bank", "HBL Islamic", "Dubai Islamic Bank"],
};

export const QARD_UL_HASAN = {
  id: "qard-ul-hasan",
  name: "Qard-ul-Hasan",
  nameUrdu: "قرض الحسن",
  icon: "🤲",
  purposeMatches: ["education", "medical", "emergency", "health"],
  description: "Benevolent loan, return exact amount only",
  banks: ["Akhuwat Foundation", "Kashf Foundation"],
};

export const ISLAMIC_PRODUCTS = [
  MURABAHA,
  DIMINISHING_MUSHARAKA,
  MUDARABA,
  IJARA,
  QARD_UL_HASAN,
];

export const matchProduct = (purpose) => {
  const normalizedPurpose = String(purpose || "").trim().toLowerCase();

  if (!normalizedPurpose) return MURABAHA;

  // ✅ Partial matching — "home purchase" will match "home"
  const matchedProduct = ISLAMIC_PRODUCTS.find((product) =>
    product.purposeMatches.some(
      (p) =>
        normalizedPurpose.includes(p) || p.includes(normalizedPurpose)
    )
  );

  return matchedProduct || MURABAHA;
};