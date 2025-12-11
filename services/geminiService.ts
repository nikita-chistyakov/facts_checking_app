import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SYSTEM_PROMPT = `
You are FCKTY, an elite Fact-Checking and Media Analysis Engine. 
Your core directive is RIGOROUS TRUTH. You verify claims against established reality using Google Search.
You NEVER make up information. If a claim is unverifiable, you state it explicitly.

You will be provided with a YouTube URL (for context search), a Transcript/Description, and optionally Comments.

Perform two functionalities:
1. FACTUAL ANALYSIS:
   - Identify key factual claims.
   - Use Google Search to verify them.
   - Rate the Overall Factual Accuracy from 1 (Complete Fabrication) to 10 (Highly Accurate).
   - Determine overall content sentiment.

2. COMMENT ANALYSIS (Expert Best Practices):
   - Analyze the provided comments for sentiment distribution.
   - Detect logical fallacies (e.g., ad hominem, strawman).
   - Identify signs of coordinated inauthentic behavior (bot-like patterns) if obvious from text patterns.

OUTPUT FORMAT:
You must output a JSON object wrapped in a code block \`\`\`json ... \`\`\`.
The structure must be:
{
  "accuracyRating": number, // 1-10
  "overallSentiment": "Positive" | "Negative" | "Neutral",
  "summary": "string",
  "claims": [
    {
      "claim": "string",
      "verdict": "True" | "False" | "Misleading" | "Unverified" | "Mixed",
      "confidenceScore": number, // 0-10
      "explanation": "string"
    }
  ],
  "commentAnalysis": {
    "overallSentiment": "Positive" | "Negative" | "Neutral" | "Polarized",
    "sentimentScore": number, // -1 to 1
    "dominantEmotions": ["string"],
    "logicalFallacies": ["string"],
    "botProbabilityScore": number, // 0-10 rating of how artificial the discourse feels
    "summary": "string"
  }
}
`;

export const analyzeContent = async (
  url: string,
  transcript: string,
  comments: string
): Promise<AnalysisResult> => {
  const ai = getClient();
  
  const prompt = `
    Analyze the following content.
    
    URL: ${url}
    
    Video Content / Transcript:
    ${transcript}
    
    Comments for Analysis:
    ${comments || "No comments provided."}
    
    Use Google Search to verify the factual claims in the Video Content.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        // We cannot use responseMimeType: 'application/json' with googleSearch tool currently
        // so we rely on the prompt to format it as a code block.
        temperature: 0.2, // Low temperature for factual consistency
      },
    });

    const text = response.text;
    
    // Extract JSON from code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```json([\s\S]*?)```/) || text.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      throw new Error("Failed to parse analysis results.");
    }

    const rawJson = jsonMatch[1] || jsonMatch[0];
    const data = JSON.parse(rawJson) as AnalysisResult;

    // Extract sources from grounding metadata
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title) || [];

    return {
      ...data,
      sources: sources as { title: string; uri: string }[],
    };

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const createChatSession = () => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "You are FCKTY, a helpful assistant explaining the fact-checking analysis you just performed. Answer follow-up questions about the claims, sentiment, and sources. Be concise and objective.",
    },
  });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<string> => {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I couldn't generate a response.";
};