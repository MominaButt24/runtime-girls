const groqApiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || "";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export const getAIExplanation = async (params) => {
  try {
    if (!groqApiKey) {
      return "Error: API Key is missing. Check your .env file.";
    }

    const { result, firRatio, monthlyPayment, monthlyIncome, loanAmount, recommendedProduct, purpose } = params;

    const prompt = `Explain this Islamic financing eligibility outcome in simple, friendly language and keep it to 2-3 sentences. Use only Islamic finance terminology and do not mention interest or Riba.
- Eligibility Result: ${result}
- Fixed Income Ratio (FIR): ${firRatio}%
- Required Monthly Payment: Rs. ${monthlyPayment}
- User's Monthly Income: Rs. ${monthlyIncome}
- Desired Advance Amount: Rs. ${loanAmount}
- Recommended Islamic Product: ${recommendedProduct}
- Purpose of Financing: ${purpose}`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.5,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content:
              "You are an Islamic finance advisor in Pakistan. Never mention interest or Riba. Only use Islamic finance terminology. Keep your response to 2-3 sentences. Be friendly and clear.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      let message = `AI Error: Request failed with status ${response.status}`;

      try {
        const errorJson = await response.json();
        const apiMessage = errorJson?.error?.message;
        if (apiMessage) {
          message = `AI Error: ${apiMessage}`;
        }
      } catch {
        // Keep generic message if error body is not JSON.
      }

      return message;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return "AI Error: Empty response from AI provider.";
    }

    return text;

  } catch (error) {
    console.error("--- Groq API Error ---");
    console.error("Message:", error.message);
    
    if (error.message.includes("429")) {
      return "AI Error: Quota exceeded. Please check your Groq plan.";
    }

    if (error.message.includes("401") || error.message.includes("403")) {
      return "AI Error: Invalid API key. Please verify EXPO_PUBLIC_GROQ_API_KEY in your .env file.";
    }
    
    return `AI Error: ${error.message || "Failed to get a response"}`;
  }
};
