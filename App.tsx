
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InputForm } from './components/InputForm';
import { Dashboard } from './components/Dashboard';
import { analyzeContent, createChatSession, sendMessageToChat } from './services/geminiService';
import { AnalysisResult } from './types';
import { Chat } from "@google/genai";

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleAnalyze = async (url: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setChatSession(null);
    setRetryStatus(null);

    try {
      const data = await analyzeContent(url);
      setResult(data);

      const newChat = createChatSession();
      await sendMessageToChat(newChat, `
        CONTEXT OF ANALYSIS:
        URL: ${url}
        Summary: ${data.summary}
        Claims: ${JSON.stringify(data.claims)}
      `);
      setChatSession(newChat);

    } catch (err: any) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("overloaded") || msg.toLowerCase().includes("resource")) {
        setError("The AI server is currently under heavy load and all retry attempts failed. Please wait a minute and try again.");
      } else {
        setError(err.message || "An unexpected error occurred during analysis.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout theme={theme} toggleTheme={toggleTheme}>
      <div className="space-y-12 pb-20">
        <section className="text-center max-w-4xl mx-auto mb-16 pt-8">
            <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Fact Check <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500">The Narrative.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Automated media verification using the SIFT methodology and real-time Search Grounding.
            </p>
        </section>

        <section className="max-w-3xl mx-auto relative">
          <InputForm onAnalyze={handleAnalyze} isLoading={loading} />
          {loading && (
             <p className="text-center text-sm font-semibold text-primary-500 mt-4 animate-pulse">
                System is researching and verifying claims. This may take up to 30 seconds...
             </p>
          )}
        </section>

        {error && (
          <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 p-6 rounded-2xl shadow-sm animate-fade-in-up">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/40 p-2 rounded-full text-red-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Analysis Halted</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="animate-fade-in-up">
            <Dashboard result={result} chatSession={chatSession} isDark={theme === 'dark'} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
