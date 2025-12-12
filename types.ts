export interface FactCheckClaim {
  claim: string;
  verdict: 'True' | 'False' | 'Misleading' | 'Unverified' | 'Mixed';
  confidenceScore: number;
  explanation: string;
  sources?: string[];
}

export interface CommentAnalysis {
  overallSentiment: 'Positive' | 'Negative' | 'Neutral' | 'Polarized';
  sentimentScore: number; // -1 to 1
  dominantEmotions: string[];
  logicalFallacies: string[];
  botProbabilityScore: number; // 0 to 10
  summary: string;
}

export interface AnalysisResult {
  accuracyRating: number; // 1 to 10
  overallSentiment: 'Positive' | 'Negative' | 'Neutral';
  summary: string;
  keyTakeaways: string[]; // New field for scannable bullet points
  claims: FactCheckClaim[];
  commentAnalysis: CommentAnalysis | null;
  sources: { title: string; uri: string }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}