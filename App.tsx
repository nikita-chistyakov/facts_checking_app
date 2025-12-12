import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { InputForm } from './components/InputForm';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { analyzeContent, createChatSession, sendMessageToChat } from './services/geminiService';
import { AnalysisResult } from './types';
import { Chat } from "@google/genai";

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setChatSession(null);

    try {
      // Analyze content - transcript and comments are now scraped/found via Search Grounding
      const data = await analyzeContent(url);
      setResult(data);

      // Initialize chat session with context
      const newChat = createChatSession();
      // Pre-seed the chat with the context so it knows what we are talking about
      await sendMessageToChat(newChat, `
        Here is the context of the analysis you just performed:
        URL: ${url}
        Summary: ${data.summary}
        Claims: ${JSON.stringify(data.claims)}
        Comment Analysis: ${JSON.stringify(data.commentAnalysis)}
        Please be ready to answer questions about this.
      `);
      setChatSession(newChat);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-12 pb-20">
        <section className="text-center max-w-4xl mx-auto mb-16 pt-8">
            <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
              Fact Check <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 animate-gradient-x">The Narrative.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              FCKTY automatically scrapes video transcripts and public discourse to detect fallacies and verify claims in seconds.
            </p>
        </section>

        <section className="max-w-3xl mx-auto relative">
          <InputForm onAnalyze={handleAnalyze} isLoading={loading} />
        </section>

        {error && (
          <div className="max-w-3xl mx-auto bg-red-50 border border-red-100 p-6 rounded-2xl shadow-sm animate-fade-in-up">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
                <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-bold text-red-800">Analysis Failed</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="animate-fade-in-up">
            <Dashboard result={result} />
            <ChatInterface chatSession={chatSession} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;