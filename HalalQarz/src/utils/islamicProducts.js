export const MURABAHA = {
	id: "murabaha",
	name: "Murabaha",
	nameUrdu: "مرابحہ",
	purposeMatches: ["vehicle", "home appliances", "goods"],
	description: "Bank buys asset, sells at fixed agreed price",
	banks: ["Meezan Bank", "Bank Islami", "HBL Islamic"],
};

export const DIMINISHING_MUSHARAKA = {
	id: "diminishing-musharaka",
	name: "Diminishing Musharaka",
	nameUrdu: "مشارکہ",
	purposeMatches: ["home"],
	description: "Co-ownership with bank, gradually buy bank share",
	banks: ["Meezan Bank", "Dubai Islamic Bank", "MCB Islamic"],
};

export const MUDARABA = {
	id: "mudaraba",
	name: "Mudaraba",
	nameUrdu: "مضاربہ",
	purposeMatches: ["business"],
	description: "Bank funds, profit shared by agreement",
	banks: ["Bank Islami", "Meezan Bank", "UBL Ameen"],
};

export const IJARA = {
	id: "ijara",
	name: "Ijara",
	nameUrdu: "اجارہ",
	purposeMatches: ["vehicle", "equipment"],
	description: "Islamic leasing, pay rental, no debt",
	banks: ["Meezan Bank", "HBL Islamic", "Dubai Islamic Bank"],
};

export const QARD_UL_HASAN = {
	id: "qard-ul-hasan",
	name: "Qard-ul-Hasan",
	nameUrdu: "قرض الحسن",
	purposeMatches: ["education", "medical", "emergency"],
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

	if (!normalizedPurpose) {
		return MURABAHA;
	}

	const matchedProduct = ISLAMIC_PRODUCTS.find((product) =>
		product.purposeMatches.includes(normalizedPurpose)
	);

	return matchedProduct || MURABAHA;
};
