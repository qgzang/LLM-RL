
import { GoogleGenAI, Type } from "@google/genai";
import { DPOExample, GRPOExample, PPOExample, GFPOExample, CISPOExample, GSPOExample } from '../types';

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
    throw error;
  }
};

export const generateGRPOScenario = async (): Promise<GRPOExample> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a training scenario for GRPO (Group Relative Policy Optimization).
      1. A user prompt (math, logic, or reasoning task).
      2. A group of 4 distinct responses. 
         - One should be perfect.
         - One should be good but slightly flawed.
         - One should be bad.
         - One should be completely irrelevant or wrong.
      3. Assign an integer score (1-10) to each response based on quality.
      Keep responses concise (under 40 words).`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            prompt: { type: Type.STRING },
            outputs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                },
                required: ['text', 'score']
              }
            }
          },
          required: ['topic', 'prompt', 'outputs']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini for GRPO");
    
    const data = JSON.parse(text);
    
    return {
      id: Math.random().toString(36).substring(7),
      topic: data.topic,
      prompt: data.prompt,
      outputs: data.outputs.map((o: any, i: number) => ({
        id: `gen-${i}`,
        text: o.text,
        score: o.score
      }))
    };

  } catch (error) {
    console.error("Failed to generate GRPO example:", error);
    throw error;
  }
};

export const generateGSPOScenario = async (): Promise<GSPOExample> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a training scenario for GSPO (Group Sequence Policy Optimization).
      1. A user prompt (creative or open-ended).
      2. A group of 4 responses of varying quality.
      3. Assign a score (1-10) to each.
      Keep responses concise.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            prompt: { type: Type.STRING },
            outputs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                },
                required: ['text', 'score']
              }
            }
          },
          required: ['topic', 'prompt', 'outputs']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini for GSPO");
    
    const data = JSON.parse(text);
    
    return {
      id: Math.random().toString(36).substring(7),
      topic: data.topic,
      prompt: data.prompt,
      outputs: data.outputs.map((o: any, i: number) => ({
        id: `gspo-${i}`,
        text: o.text,
        score: o.score
      }))
    };

  } catch (error) {
    console.error("Failed to generate GSPO example:", error);
    throw error;
  }
};

export const generateGFPOScenario = async (): Promise<GFPOExample> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a training scenario for GFPO (Group Filtered Policy Optimization) focusing on concise reasoning.
      1. A user prompt (Math, Logic, or Common Sense).
      2. Generate 5 responses:
         - 2 Must be INCORRECT.
         - 3 Must be CORRECT, but vary in length (one very short, one medium, one very verbose/long-winded).
      3. Flag each as correct/incorrect.
      4. Estimate token length (integer).`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            prompt: { type: Type.STRING },
            outputs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  isCorrect: { type: Type.BOOLEAN },
                  length: { type: Type.NUMBER }
                },
                required: ['text', 'isCorrect', 'length']
              }
            }
          },
          required: ['topic', 'prompt', 'outputs']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini for GFPO");
    
    const data = JSON.parse(text);
    
    return {
      id: Math.random().toString(36).substring(7),
      topic: data.topic,
      prompt: data.prompt,
      outputs: data.outputs.map((o: any, i: number) => ({
        id: `gfpo-${i}`,
        text: o.text,
        isCorrect: o.isCorrect,
        length: o.length
      }))
    };

  } catch (error) {
    console.error("Failed to generate GFPO example:", error);
    throw error;
  }
};

export const generatePPOScenario = async (): Promise<PPOExample> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a PPO (Proximal Policy Optimization) training scenario.
      1. A user prompt (general knowledge or creative).
      2. A single model response.
      3. A "Reward Score" (float between 0-10) that a Reward Model would assign to this response.
      4. An "Initial Value Estimate" (float between 0-10) that the Critic Model would predict for the prompt before seeing the answer.
      Keep response concise.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            prompt: { type: Type.STRING },
            response: { type: Type.STRING },
            initialReward: { type: Type.NUMBER },
            initialValue: { type: Type.NUMBER }
          },
          required: ['topic', 'prompt', 'response', 'initialReward', 'initialValue']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini for PPO");
    
    const data = JSON.parse(text);
    
    return {
      id: Math.random().toString(36).substring(7),
      topic: data.topic,
      prompt: data.prompt,
      response: data.response,
      initialReward: data.initialReward,
      initialValue: data.initialValue
    };

  } catch (error) {
    console.error("Failed to generate PPO example:", error);
    throw error;
  }
};

export const generateCISPOScenario = async (): Promise<CISPOExample> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a CISPO (Clipped IS-weight Policy Optimization) training scenario.
      1. A prompt.
      2. A response text.
      3. A log probability (behaviorLogProb) for that response from an "old" policy (approx between -5.0 and -0.1).
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            prompt: { type: Type.STRING },
            response: { type: Type.STRING },
            behaviorLogProb: { type: Type.NUMBER },
          },
          required: ['topic', 'prompt', 'response', 'behaviorLogProb']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini for CISPO");
    
    const data = JSON.parse(text);
    
    return {
      id: Math.random().toString(36).substring(7),
      topic: data.topic,
      prompt: data.prompt,
      response: data.response,
      behaviorLogProb: data.behaviorLogProb
    };

  } catch (error) {
    console.error("Failed to generate CISPO example:", error);
    throw error;
  }
};