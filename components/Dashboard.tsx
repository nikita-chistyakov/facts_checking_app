import React, { useState } from 'react';
import { AnalysisResult, FactCheckClaim } from '../types';
import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Chat } from "@google/genai";
import { ChatInterface } from './ChatInterface';

interface DashboardProps {
  result: AnalysisResult;
  chatSession: Chat | null;
}

const InfoTooltip: React.FC<{ content: React.ReactNode; align?: 'left' | 'center' | 'right' }> = ({ content, align = 'center' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-2 align-middle z-30">
      <button
        type="button"
        className="text-slate-300 hover:text-primary-500 transition-colors focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        aria-label="More information"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>
      
      <div 
        className={`
          absolute bottom-full mb-3 w-72 p-4 bg-slate-800/95 backdrop-blur-sm text-slate-100 text-xs leading-relaxed rounded-2xl shadow-xl shadow-slate-900/20 transition-all duration-200 transform origin-bottom border border-slate-700
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}
          ${align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'}
        `}
      >
        <div className="relative z-10 font-medium">
            {content}
        </div>
        {/* Triangle pointer */}
         <div 
            className={`absolute -bottom-1.5 w-3 h-3 bg-slate-800/95 border-r border-b border-slate-700 transform rotate-45 
            ${align === 'left' ? 'left-4' : align === 'right' ? 'right-4' : 'left-1/2 -translate-x-1/2'}`}
        ></div>
      </div>
    </div>
  );
};

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const data = [
    { name: 'Accuracy', value: score, fill: score >= 8 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444' },
    { name: 'Max', value: 10, fill: '#f1f5f9' },
  ];
  
  const scoreColor = score >= 8 ? 'text-emerald-500' : score >= 5 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="relative h-56 w-full flex items-center justify-center -mt-4">
       <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={12} 
          data={data} 
          startAngle={90} 
          endAngle={-270}
        >
          <RadialBar
            background={{ fill: '#f1f5f9' }}
            dataKey="value"
            cornerRadius={30}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
        <span className={`text-6xl font-extrabold ${scoreColor} drop-shadow-sm`}>{score}</span>
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Trust Score</span>
      </div>
    </div>
  );
};

const ClaimCard: React.FC<{ claim: FactCheckClaim }> = ({ claim }) => {
  const colors = {
    True: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    False: 'bg-red-100 text-red-800 border-red-200',
    Misleading: 'bg-orange-100 text-orange-800 border-orange-200',
    Unverified: 'bg-slate-100 text-slate-800 border-slate-200',
    Mixed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const badgeColor = colors[claim.verdict] || colors.Unverified;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group z-10 relative">
      <div className="flex justify-between items-start gap-4 mb-3">
        <h4 className="font-bold text-slate-800 text-base leading-snug group-hover:text-primary-700 transition-colors">{claim.claim}</h4>
        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${badgeColor}`}>
          {claim.verdict}
        </span>
      </div>
      <p className="text-slate-600 text-sm mb-4 leading-relaxed">{claim.explanation}</p>
      <div className="flex items-center gap-3">
         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex-1">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${claim.confidenceScore > 7 ? 'bg-emerald-400' : 'bg-primary-400'}`}
                style={{ width: `${claim.confidenceScore * 10}%` }}
            ></div>
         </div>
         <div className="flex items-center">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Conf: {claim.confidenceScore}/10</span>
            <InfoTooltip 
                align="right"
                content={
                    <div>
                        <p className="mb-2 font-bold text-slate-200">AI Confidence Level</p>
                        <p className="mb-2">Indicates how verifiable this specific claim was based on search results.</p>
                        <ul className="list-disc pl-3 space-y-1 text-slate-300">
                            <li><span className="text-emerald-400 font-bold">8-10:</span> Strong evidence found (Direct quotes, official data).</li>
                            <li><span className="text-amber-400 font-bold">5-7:</span> Partial evidence or conflicting sources.</li>
                            <li><span className="text-red-400 font-bold">1-4:</span> Low verified information available.</li>
                        </ul>
                    </div>
                } 
            />
         </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ result, chatSession }) => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* 1. Top Row: Scores & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Score Card */}
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 col-span-1 relative">
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>
            <div className="relative z-10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Factual Accuracy</h3>
                <InfoTooltip 
                    align="right"
                    content={
                        <div>
                            <p className="mb-2 font-bold text-slate-200">What does this score mean?</p>
                            <p className="mb-2">A calculated rating (1-10) of the video's overall adherence to established facts.</p>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <span className="text-emerald-400 font-bold w-8">8-10</span>
                                    <span><strong className="text-emerald-400">High Accuracy.</strong> Claims are well-supported by trusted sources.</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-amber-400 font-bold w-8">5-7</span>
                                    <span><strong className="text-amber-400">Mixed.</strong> Contains some truth but lacks context or cherry-picks data.</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-red-400 font-bold w-8">1-4</span>
                                    <span><strong className="text-red-400">Low Accuracy.</strong> Contains debunked theories or significant factual errors.</span>
                                </div>
                            </div>
                        </div>
                    } 
                />
            </div>
          
          <ScoreGauge score={result.accuracyRating} />
          
          <div className="mt-2 text-center relative z-10">
             <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-sm
                ${result.overallSentiment === 'Positive' ? 'bg-green-100 text-green-700' : 
                  result.overallSentiment === 'Negative' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                Sentiment: {result.overallSentiment}
             </span>
          </div>
        </div>

        {/* Summary Card (Updated for Readability) */}
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 col-span-1 md:col-span-2 flex flex-col relative overflow-hidden">
           {/* Decorative Top Line */}
           <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 to-accent-500"></div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-6 relative z-10 flex items-center gap-2">
            Executive Analysis
          </h3>
          
          <p className="text-slate-600 leading-relaxed text-lg relative z-10 mb-8 font-medium">
            {result.summary}
          </p>
          
          {/* New Scannable Key Takeaways Section */}
          {result.keyTakeaways && result.keyTakeaways.length > 0 && (
            <div className="relative z-10 mb-8 bg-surface-50 rounded-2xl p-6 border border-slate-100 shadow-inner">
                <h4 className="text-xs font-extrabold text-primary-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Core Insights
                </h4>
                <ul className="space-y-4">
                    {result.keyTakeaways.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0 shadow-sm shadow-primary-300"></div>
                            <span className="leading-snug">{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
          )}
          
          {/* Verified Sources */}
          {result.sources.length > 0 && (
            <div className="mt-auto pt-6 border-t border-slate-100 relative z-10">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Verified Sources
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.sources.slice(0, 4).map((source, idx) => (
                  <li key={idx}>
                    <a href={source.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                       <span className="bg-primary-50 text-primary-600 p-1.5 rounded-md group-hover:bg-primary-100 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                         </svg>
                       </span>
                       <span className="text-sm text-slate-600 group-hover:text-primary-700 font-medium truncate transition-colors">
                        {source.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 2. Verified Claims (Full Width) */}
      <div className="space-y-5">
        <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            </div>
            Verified Claims
        </h3>
        <div className="space-y-4">
            {result.claims.map((claim, idx) => (
            <ClaimCard key={idx} claim={claim} />
            ))}
        </div>
      </div>

      {/* 3. Bottom Row: Discourse Analysis & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Discourse Analysis */}
        {result.commentAnalysis && (
            <div className="space-y-5">
                <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                    </div>
                    Discourse Analysis
                </h3>
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 h-full">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wide">Overall Sentiment</span>
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                            result.commentAnalysis.overallSentiment === 'Polarized' ? 'bg-orange-100 text-orange-800' : 
                            result.commentAnalysis.overallSentiment === 'Positive' ? 'bg-emerald-100 text-emerald-800' :
                            result.commentAnalysis.overallSentiment === 'Negative' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                        }`}>
                            {result.commentAnalysis.overallSentiment}
                        </span>
                    </div>
                    
                    <p className="text-slate-700 text-base mb-8 leading-relaxed font-medium">{result.commentAnalysis.summary}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                            <div className="flex items-center gap-1 mb-2">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Bot Probability</span>
                                <InfoTooltip 
                                    align="left"
                                    content={
                                        <div>
                                            <p className="mb-2 font-bold text-slate-200">Is the conversation real?</p>
                                            <p className="mb-2">Calculated by analyzing comment timing, repetition, and linguistic patterns typical of automated scripts.</p>
                                            <ul className="list-disc pl-3 space-y-1 text-slate-300">
                                                <li><span className="text-red-400 font-bold">High:</span> Likely astroturfing or spam.</li>
                                                <li><span className="text-emerald-400 font-bold">Low:</span> Organic human discussion.</li>
                                            </ul>
                                        </div>
                                    } 
                                />
                            </div>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-extrabold text-slate-800">{result.commentAnalysis.botProbabilityScore}</span>
                                <span className="text-xs font-semibold text-slate-500 mb-1.5 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                    {result.commentAnalysis.botProbabilityScore > 6 ? 'High Risk' : 'Low Risk'}
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className={`h-full rounded-full ${result.commentAnalysis.botProbabilityScore > 6 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${result.commentAnalysis.botProbabilityScore * 10}%` }}></div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-1 mb-2">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Logical Fallacies</span>
                                <InfoTooltip 
                                    align="right"
                                    content={
                                        <div>
                                            <p className="mb-2 font-bold text-slate-200">Common Flaws in Reasoning</p>
                                            <p className="mb-2">We scan comments for manipulative arguments that distract from the truth.</p>
                                            <ul className="list-disc pl-3 space-y-1 text-slate-300">
                                                <li><span className="text-white font-bold">Ad Hominem:</span> Attacking the person.</li>
                                                <li><span className="text-white font-bold">Straw Man:</span> Distorting an argument.</li>
                                                <li><span className="text-white font-bold">False Equivalence:</span> Comparing unrelated things.</li>
                                            </ul>
                                        </div>
                                    } 
                                />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {result.commentAnalysis.logicalFallacies.length > 0 ? (
                                    result.commentAnalysis.logicalFallacies.slice(0,3).map((f, i) => (
                                        <span key={i} className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-md">{f}</span>
                                    ))
                                ) : (
                                    <span className="text-sm font-medium text-slate-500 italic">None detected</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Dominant Emotions</span>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {result.commentAnalysis.dominantEmotions.map((emotion, idx) => (
                                <span key={idx} className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-full text-sm font-semibold">
                                    {emotion}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {/* Right Col: Chat Interface */}
        <div className="space-y-5">
             {/* Use same header height spacer if needed or just a header to align */}
             <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                Ask Assistant
            </h3>
            <ChatInterface chatSession={chatSession} />
        </div>
      </div>
    </div>
  );
};