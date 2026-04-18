// HalalQarz - formatters.js

export const formatCurrency = (amount) => {
	const safeAmount = Number(amount) || 0;
	return `Rs. ${safeAmount.toLocaleString("en-PK")}`;
};

export const formatDate = (timestamp) => {
	if (!timestamp) {
		return "";
	}

	let dateValue;

	// Support Firestore timestamp, JS Date, and raw epoch values.
	if (typeof timestamp?.toDate === "function") {
		dateValue = timestamp.toDate();
	} else {
		dateValue = new Date(timestamp);
	}

	if (Number.isNaN(dateValue.getTime())) {
		return "";
	}

	return dateValue.toLocaleDateString("en-PK", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
};
