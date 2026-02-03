
import { GoogleGenAI } from "@google/genai";

export async function getDeepSearchAnalysis(query: string) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "API Key not found.";

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a professional market analysis for a B2B buyer interested in: "${query}". 
      Include 3 top trends, estimated price ranges for wholesale, and key manufacturing hubs. 
      Keep it concise and structured in bullet points.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Deep search error:", error);
    return "Failed to analyze your request. Please try again.";
  }
}
