import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SYSTEM_PROMPT = `
You are FCKTY, an elite Fact-Checking and Media Analysis Engine. 
Your core directive is RIGOROUS TRUTH.

You will be provided with a YouTube Video Title, Author, and URL.
**CRITICAL INSTRUCTION**: You must ONLY analyze the content of the SPECIFIC video identified by the Title. 
DO NOT analyze other videos by the same author.
DO NOT analyze the channel in general.
If you cannot find the transcript or specifics for THIS exact video, admit it and return an accuracy rating of 0.

EXECUTION STEPS:
1. **Target Identification**: Use Google Search to find the specific video by searching for its TITLE and AUTHOR.
2. **Content Extraction**: Extract the transcript, summary, and key arguments of THIS specific video.
3. **Discourse Extraction**: Search for comments and reactions specifically regarding THIS video title.
4. **Fact Checking**: Verify the claims found in Step 2.
5. **Sentiment Analysis**: Analyze the sentiment of the discourse.

OUTPUT FORMAT:
You must output a JSON object wrapped in a code block \`\`\`json ... \`\`\`.
The structure must be:
{
  "accuracyRating": number, // 1-10
  "overallSentiment": "Positive" | "Negative" | "Neutral",
  "summary": "string (Must start with: 'Analysis of [Video Title]: ...')",
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

// Helper to fetch video details to ground the AI before it even searches
async function getVideoMetadata(url: string): Promise<{ title: string; author_name: string } | null> {
  try {
    // Using noembed to get oEmbed data without auth - supports YouTube
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    if (data.error || !data.title) return null;
    return {
      title: data.title,
      author_name: data.author_name
    };
  } catch (e) {
    console.warn("Failed to fetch video metadata", e);
    return null;
  }
}

export const analyzeContent = async (
  url: string
): Promise<AnalysisResult> => {
  const ai = getClient();
  
  // 1. Attempt to get the actual title/author to prevent hallucination
  const metadata = await getVideoMetadata(url);
  
  let contentContext = "";
  if (metadata) {
    contentContext = `
    TARGET VIDEO TITLE: "${metadata.title}"
    TARGET VIDEO AUTHOR: "${metadata.author_name}"
    TARGET URL: ${url}
    
    INSTRUCTION: Perform a Google Search specifically for "${metadata.title}" transcript and reviews. Ensure you are analyzing THIS video and not a related one.
    `;
  } else {
    contentContext = `
    TARGET URL: ${url}
    
    INSTRUCTION: Extract the specific video title from the URL search results first, then analyze that specific video.
    `;
  }

  const prompt = `
    ${contentContext}

    Please perform the "Web Scraping" and Analysis:
    1. Search for the content of this specific video (Transcript/Summary).
    2. Search for the comments/public reaction to this specific video.
    3. Verify the claims and analyze the sentiment based on what you find.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        temperature: 0.1, // Very low temperature for factual consistency
      },
    });

    const text = response.text;
    
    // Extract JSON from code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```json([\s\S]*?)```/) || text.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      throw new Error("Failed to parse analysis results. The video might be too obscure to analyze via Search.");
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