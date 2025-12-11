import React, { useState } from 'react';

interface InputFormProps {
  onAnalyze: (url: string, transcript: string, comments: string) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [comments, setComments] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'comments'>('content');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(url, transcript, comments);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden ring-1 ring-slate-900/5">
      <div className="p-2 bg-slate-50/50 border-b border-slate-100 flex gap-2">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-3 px-4 text-sm font-bold rounded-2xl transition-all duration-200 ${activeTab === 'content' ? 'bg-white text-primary-600 shadow-md shadow-slate-200/50 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`}
        >
          1. Video Content
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-3 px-4 text-sm font-bold rounded-2xl transition-all duration-200 ${activeTab === 'comments' ? 'bg-white text-primary-600 shadow-md shadow-slate-200/50 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`}
        >
          2. Comments (Optional)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {activeTab === 'content' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">YouTube URL</label>
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all p-4 outline-none font-medium"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Transcript / Claims
                <span className="text-slate-400 font-normal ml-2 text-xs uppercase tracking-wide">For verification</span>
              </label>
              <textarea
                className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all p-4 outline-none h-40 resize-none font-medium text-slate-600"
                placeholder="Paste the video transcript or key claims here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className="text-primary-600 hover:text-primary-700 text-sm font-bold flex items-center gap-1 group"
              >
                Add Comments 
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                User Comments
                <span className="text-slate-400 font-normal ml-2 text-xs uppercase tracking-wide">For sentiment analysis</span>
              </label>
              <textarea
                className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all p-4 outline-none h-56 resize-none font-medium text-slate-600"
                placeholder="Paste a list of comments here..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              ></textarea>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !url}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running Analysis...
                  </>
                ) : (
                  'Analyze Content'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};