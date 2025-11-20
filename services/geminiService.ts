import { GoogleGenAI, Type } from "@google/genai";
import { DPOExample } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateDPOScenario = async (): Promise<DPOExample> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a single training example for DPO (Direct Preference Optimization). 
      It should include a user prompt, a "chosen" (correct/better) response, and a "rejected" (incorrect/worse/hallucinated) response.
      Keep the responses relatively short (under 50 words) for UI visualization purposes.
      Topics can range from Coding, Science, History, or General Knowledge.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING, description: "The user query" },
            chosen: { type: Type.STRING, description: "The high quality answer" },
            rejected: { type: Type.STRING, description: "The lower quality or incorrect answer" },
            topic: { type: Type.STRING, description: "Category of the example" }
          },
          required: ['prompt', 'chosen', 'rejected', 'topic']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    const data = JSON.parse(text);
    
    return {
      id: Math.random().toString(36).substring(7),
      prompt: data.prompt,
      chosen: data.chosen,
      rejected: data.rejected,
      topic: data.topic
    };

  } catch (error) {
    console.error("Failed to generate DPO example:", error);
    // Fallback handled in component
    throw error;
  }
};
