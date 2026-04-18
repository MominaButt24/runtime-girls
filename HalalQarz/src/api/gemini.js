import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  process.env.EXPO_PUBLIC_GEN_API_KEY ||
  "";

const genAI = new GoogleGenerativeAI(geminiApiKey);

export const getAIExplanation = async (params) => {
  try {
    if (!geminiApiKey) {
      return "Error: API Key is missing. Check your .env file.";
    }

    const { result, firRatio, monthlyPayment, monthlyIncome, loanAmount, recommendedProduct, purpose } = params;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      systemInstruction:
        "You are an Islamic finance advisor in Pakistan. Never mention interest or Riba. Only use Islamic finance terminology. Keep your response to 2-3 sentences. Be friendly and clear."
    });

    const prompt = `Explain this Islamic financing eligibility outcome in simple, friendly language and keep it to 2-3 sentences. Use only Islamic finance terminology and do not mention interest or Riba.
- Eligibility Result: ${result}
- Fixed Income Ratio (FIR): ${firRatio}%
- Required Monthly Payment: Rs. ${monthlyPayment}
- User's Monthly Income: Rs. ${monthlyIncome}
- Desired Advance Amount: Rs. ${loanAmount}
- Recommended Islamic Product: ${recommendedProduct}
- Purpose of Financing: ${purpose}`;
    
    const aiResult = await model.generateContent(prompt);
    const response = aiResult.response;
    return response.text();

  } catch (error) {
    console.error("--- Gemini API Error ---");
    console.error("Message:", error.message);
    
    if (error.message.includes("429")) {
      return "AI Error: Quota exceeded. Please check your Google AI Studio plan.";
    }

    if (error.message.includes("404")) {
      return "AI Error: Model not found. Please ensure you are using a standard API Key from Google AI Studio.";
    }
    
    return `AI Error: ${error.message || "Failed to get a response"}`;
  }
};
