import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from '../types';

const getClient = () => {
  const env = (window as any).env;
  console.log("Debug: window.env is:", env);
  const apiKey = env?.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    console.error("API Key is missing! Make sure GEMINI_API_KEY is set in Cloud Run variables.");
    console.error("Current window.env:", (window as any).env);
  } else {
    console.log("API Key found (length):", apiKey.length);
  }
  return new GoogleGenAI({ apiKey });
};

const ANALYSIS_SYSTEM_PROMPT = `
You are INFAKT, an elite Fact-Checking and Media Analysis Engine. 
Your core directive is RIGOROUS TRUTH and EXHAUSTIVE RESEARCH.

You will be provided with a YouTube Video Title, Author, and URL.

**CORE PROTOCOLS:**
1.  **Deep Search**: Do not rely on a single search query. You must perform multiple searches to gather transcripts, summaries, and distinct viewpoints.
2.  **Source Exhaustiveness**: When verifying claims, you must search for *primary sources* (government data, academic papers, direct quotes) rather than just news recaps. If a source is weak, search again.
3.  **Discourse Breadth**: When analyzing sentiment, look beyond the immediate video page. Search for discussions on Reddit, Twitter/X, and niche forums to find critical or polarized perspectives.
4.  **Target Integrity**: ONLY analyze the specific video identified. Do not hallucinate content from other videos by the same author.

**OUTPUT FORMAT:**
You must output a JSON object wrapped in a code block \`\`\`json ... \`\`\`.
The structure must be:
{
  "accuracyRating": number, // 1-10
  "overallSentiment": "Positive" | "Negative" | "Neutral",
  "summary": "string (Must start with: 'Analysis of [Video Title]: ...')",
  "keyTakeaways": ["string", "string", "string"], // 3-5 concise, scannable bullet points.
  "claims": [
    {
      "claim": "string",
      "verdict": "True" | "False" | "Misleading" | "Unverified" | "Mixed",
      "confidenceScore": number, // 0-10
      "explanation": "string (Cite specific data or contradictions found)"
    }
  ],
  "commentAnalysis": {
    "overallSentiment": "Positive" | "Negative" | "Neutral" | "Polarized",
    "sentimentScore": number, // -1 to 1
    "dominantEmotions": ["string"],
    "logicalFallacies": ["string"],
    "botProbabilityScore": number, // 0-10
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

    **EXECUTE DEEP RESEARCH PLAN:**

    1. **Content Retrieval**: Aggressively search for the full transcript, detailed summaries, or comprehensive reviews of this specific video.
    2. **Discourse Mining**: Search for "Reddit [Video Title]", "Twitter reaction [Video Title]", and "forum discussion [Video Title]" to find diverse, organic user feedback beyond just YouTube top comments.
    3. **Rigorous Fact-Checking**: For every major claim identified in the video:
        - Search specifically for that claim combined with keywords like "debunked", "fact check", "study", "statistics".
        - Prioritize primary sources (official statistics, academic papers) over secondary news.
        - If verified sources are scarce, explicitly state this in the 'explanation' and set the verdict to 'Unverified'.
    4. **Synthesis**: Combine these into the AnalysisResult JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
        // Enable thinking to allow the model to plan multi-step searches for better coverage
        thinkingConfig: { thinkingBudget: 8192 },
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
      keyTakeaways: data.keyTakeaways || [], // Ensure fallback if model omits it
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
      systemInstruction: "You are INFAKT, a helpful assistant explaining the fact-checking analysis you just performed. Answer follow-up questions about the claims, sentiment, and sources. Be concise and objective.",
    },
  });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<string> => {
  const response: GenerateContentResponse = await chat.sendMessage({ message });
  return response.text || "I couldn't generate a response.";
};