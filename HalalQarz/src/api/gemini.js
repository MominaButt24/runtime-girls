import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEN_API_KEY } from "@env";

// Initialize the SDK
const genAI = new GoogleGenerativeAI(GEN_API_KEY || "");

export const generateAIResponse = async (prompt, context = "") => {
  try {
    if (!GEN_API_KEY) {
      return "Error: API Key is missing. Check your .env file.";
    }

    /**
     * Using the full model resource name.
     * Some older SDK versions or specific key types require the 'models/' prefix.
     */
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });

    const fullPrompt = `${context}\n\nUser Question: ${prompt}`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error("--- Gemini API Error ---");
    console.error("Message:", error.message);
    
    // Check for Quota/Billing issues (429)
    if (error.message.includes("429")) {
      return "AI Error: Quota exceeded. Please check your Google AI Studio plan.";
    }

    // Check for Model/Version issues (404)
    if (error.message.includes("404")) {
      return "AI Error: Model not found. Please ensure you are using a standard API Key from Google AI Studio (starting with 'AIza').";
    }
    
    return `AI Error: ${error.message || "Failed to get a response"}`;
  }
};
