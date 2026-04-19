// HalalQarz - islamicProducts.js
export const MURABAHA = {
  id: "murabaha",
  name: "Murabaha",
  nameUrdu: "مرابحہ",
  icon: "🏪",
  // ✅ Removed "vehicle" — that belongs to Ijara
  purposeMatches: ["goods", "home appliances", "everyday items", "other"],
  description: "Bank buys it, sells it to you at fixed price",
  explanation: "The bank purchases the item you need and sells it to you at a fixed higher price. The profit amount is agreed upfront and never changes. You pay in easy monthly installments with zero hidden charges.",
  banks: ["Meezan Bank", "Bank Islami", "HBL Islamic"],
};

export const DIMINISHING_MUSHARAKA = {
  id: "diminishing-musharaka",
  name: "Diminishing Musharaka",
  nameUrdu: "مشارکہ",
  icon: "🏠",
  purposeMatches: ["home", "property", "house", "home purchase"],
  description: "You and bank co-own, you gradually buy bank out",
  explanation: "You and the bank jointly own the property together. Every month you pay rent for the bank's share and also buy a small portion of it. Over time your ownership increases until you own it completely.",
  banks: ["Meezan Bank", "Dubai Islamic Bank", "MCB Islamic"],
};

export const MUDARABA = {
  id: "mudaraba",
  name: "Mudaraba",
  nameUrdu: "مضاربہ",
  icon: "💼",
  purposeMatches: ["business", "startup", "trade"],
  description: "Bank funds, you work, profit is shared",
  explanation: "The bank provides all the capital and you provide the skills and effort to run the business. Any profit earned is shared between you and the bank by an agreed percentage. No fixed repayment — only profit sharing.",
  banks: ["Bank Islami", "Meezan Bank", "UBL Ameen"],
};

export const IJARA = {
  id: "ijara",
  name: "Ijara",
  nameUrdu: "اجارہ",
  icon: "🚗",
  // ✅ Vehicle correctly stays here only
  purposeMatches: ["vehicle", "car", "equipment", "machinery"],
  description: "Bank owns it, you rent it, option to buy later",
  explanation: "The bank buys the asset such as a car or equipment and leases it to you. You pay a fixed monthly rental to use it. At the end of the lease you may have the option to purchase it at an agreed price.",
  banks: ["Meezan Bank", "HBL Islamic", "Dubai Islamic Bank"],
};

export const QARD_UL_HASAN = {
  id: "qard-ul-hasan",
  name: "Qard-ul-Hasan",
  nameUrdu: "قرض الحسن",
  icon: "🤲",
  purposeMatches: ["education", "medical", "emergency", "health"],
  description: "Borrow exactly what you need, return exactly that",
  explanation: "A completely free loan given out of goodwill and Islamic brotherhood. You borrow a fixed amount and return exactly that same amount with nothing extra. It is one of the most virtuous acts in Islamic finance.",
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

  // 1. Strict Exact Match First (so "home" does not trigger "home appliances")
  let matchedProduct = ISLAMIC_PRODUCTS.find((product) =>
    product.purposeMatches.some((p) => p === normalizedPurpose)
  );

  // 2. Fallback to broad partial match
  if (!matchedProduct) {
    matchedProduct = ISLAMIC_PRODUCTS.find((product) =>
      product.purposeMatches.some(
        (p) =>
          normalizedPurpose.includes(p) || p.includes(normalizedPurpose)
      )
    );
  }

  return matchedProduct || MURABAHA;
};