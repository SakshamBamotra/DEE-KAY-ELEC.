import { GoogleGenAI, Type } from "@google/genai";
import { Product, Category } from "../types";

// Initialize safely. If the key is missing (e.g. during first deploy), 
// we use a dummy string so the app loads, but specific calls will fail gracefully later.
const apiKey = process.env.API_KEY || "missing-api-key";
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Generates a marketing description based on product name and category.
 */
export const generateProductDetails = async (name: string, category: string): Promise<{ description: string }> => {
  if (!process.env.API_KEY) {
    console.warn("API Key is missing. Please add API_KEY to Vercel Environment Variables.");
    return { description: "AI generation unavailable (Missing API Key)." };
  }

  const prompt = `
    I am adding a product to my electronics shop inventory.
    Product Details: "${name}"
    Category: "${category}"
    
    Please generate a concise, attractive 2-sentence marketing description suitable for an inventory app or e-commerce listing.
    
    Return in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
          },
          required: ["description"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      description: "Could not generate description at this time."
    };
  }
};

/**
 * Analyzes the inventory to provide business insights.
 */
export const analyzeInventory = async (products: Product[]): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing. Please check your settings.";

  // Simplify payload to save tokens
  const inventorySummary = products.map(p => ({
    name: p.name,
    company: p.company,
    category: p.category,
    stock: p.stock,
    price: p.price
  }));

  const prompt = `
    Analyze the following electronics inventory list and provide 3 key actionable business insights.
    Focus on:
    1. Brand dominance (which companies have most stock/value).
    2. Category stock levels (critical low stock alerts).
    3. Missing opportunities (categories or brands underrepresented).
    
    Inventory Data:
    ${JSON.stringify(inventorySummary)}
    
    Keep the response professional, concise, and formatted in Markdown bullet points. Use '₹' for currency.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Failed to analyze inventory. Please try again later.";
  }
};

/**
 * Chat with the inventory.
 */
export const chatWithInventory = async (query: string, products: Product[]): Promise<string> => {
    if (!process.env.API_KEY) return "API Key missing.";
  
    const inventoryContext = JSON.stringify(products.map(p => ({
        name: p.name,
        company: p.company,
        category: p.category,
        stock: p.stock,
        price: p.price
    })));
  
    const prompt = `
      You are an intelligent inventory assistant for an electronics shop.
      Here is the current inventory data: ${inventoryContext}
      
      User Query: "${query}"
      
      Answer the user's query based strictly on the provided data. Be helpful and brief.
      Use '₹' for currency.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
      return response.text || "I couldn't understand that.";
    } catch (error) {
      console.error("Chat Error:", error);
      return "Sorry, I'm having trouble processing that right now.";
    }
  };