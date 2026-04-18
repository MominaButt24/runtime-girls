// HalalQarz - eligibilityEngine.js

const MURABAHA_TOTAL_MULTIPLIER = 1.12;

export const calculateMonthlyPayment = (loanAmount, months) => {
	const safeLoanAmount = Number(loanAmount) || 0;
	const safeMonths = Number(months) || 0;

	if (safeMonths <= 0) {
		return 0;
	}

	return (safeLoanAmount * MURABAHA_TOTAL_MULTIPLIER) / safeMonths;
};

export const calculateFIR = (existingObligations, newMonthlyPayment, monthlyIncome) => {
	const safeExistingObligations = Number(existingObligations) || 0;
	const safeNewMonthlyPayment = Number(newMonthlyPayment) || 0;
	const safeMonthlyIncome = Number(monthlyIncome) || 0;

	if (safeMonthlyIncome <= 0) {
		return 0;
	}

	return ((safeExistingObligations + safeNewMonthlyPayment) / safeMonthlyIncome) * 100;
};

export const checkEligibility = ({
	monthlyIncome,
	existingObligations,
	loanAmount,
	period,
	employmentType,
	creditHistory,
	age,
	hasGuarantor,
}) => {
	const safeMonthlyIncome = Number(monthlyIncome) || 0;
	const safeExistingObligations = Number(existingObligations) || 0;
	const safeLoanAmount = Number(loanAmount) || 0;
	const safePeriod = Number(period) || 0;
	const safeAge = Number(age) || 0;

	const monthlyPayment = calculateMonthlyPayment(safeLoanAmount, safePeriod);
	const firRatio = calculateFIR(safeExistingObligations, monthlyPayment, safeMonthlyIncome);

	const flags = [];
	let score = 100;

	if (firRatio > 60) {
		score -= 50;
		flags.push("FIR too high");
	} else if (firRatio >= 45) {
		score -= 25;
		flags.push("FIR borderline");
	}

	if (safeMonthlyIncome < 25000) {
		score -= 30;
		flags.push("Income below minimum threshold");
	}

	if (employmentType === "unemployed") {
		score -= 40;
		flags.push("Employment not stable");
	}

	if (creditHistory === "poor") {
		score -= 20;
		flags.push("Credit history is poor");
	}

	if (safeAge < 21 || safeAge > 60) {
		score -= 50;
		flags.push("Age outside allowed range");
	}

	if (hasGuarantor) {
		score += 10;
		flags.push("Guarantor provided");
	}

	const normalizedScore = Math.max(0, Math.min(110, score));

	let result = "notEligible";
	if (normalizedScore >= 70) {
		result = "eligible";
	} else if (normalizedScore >= 45) {
		result = "conditional";
	}

	return {
		result,
		firRatio,
		monthlyPayment,
		score: normalizedScore,
		flags,
	};
};
