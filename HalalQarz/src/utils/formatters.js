// HalalQarz - formatters.js
export const formatCurrency = (amount) => {
  const safeAmount = Number(amount) || 0;
  
  // ✅ en-US works on all Android devices reliably
  return `Rs. ${safeAmount.toLocaleString("en-US")}`;
};

export const formatDate = (timestamp) => {
  if (!timestamp) return "";

  let dateValue;

  if (typeof timestamp?.toDate === "function") {
    dateValue = timestamp.toDate();
  } else {
    dateValue = new Date(timestamp);
  }

  if (Number.isNaN(dateValue.getTime())) return "";

  // ✅ en-US fallback for Android compatibility
  return dateValue.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// ✅ NEW - format percentage cleanly
export const formatPercentage = (value) => {
  const safeValue = Number(value) || 0;
  return `${safeValue.toFixed(2)}%`;
};