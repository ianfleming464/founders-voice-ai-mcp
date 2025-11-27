'use client';

import { useState } from 'react';

interface GenerationResponse {
  content: string;
  sourceChunks: number;
  userId: string;
  contentType: string;
  prompt: string;
}

export default function Home() {
  const [userId, setUserId] = useState('demo_founder');
  const [contentType, setContentType] = useState<'linkedin' | 'investor'>('linkedin');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual'>('professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim() || !prompt.trim()) {
      setError('Please provide both User ID and Prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId.trim(),
          contentType,
          prompt: prompt.trim(),
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate content');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Network error - please try again');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black py-12 px-4">
      <main className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
            Founders Voice AI
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Generate content in your authentic voice using RAG-powered AI
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 mb-8">
          {/* User ID */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg
                         bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., demo_founder"
            />
          </div>

          {/* Content Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Content Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setContentType('linkedin')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  contentType === 'linkedin'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }`}
              >
                LinkedIn Post
              </button>
              <button
                type="button"
                onClick={() => setContentType('investor')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  contentType === 'investor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }`}
              >
                Investor Update
              </button>
            </div>
          </div>

          {/* Tone (only for LinkedIn) */}
          {contentType === 'linkedin' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Tone
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTone('professional')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    tone === 'professional'
                      ? 'bg-zinc-800 dark:bg-zinc-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  Professional
                </button>
                <button
                  type="button"
                  onClick={() => setTone('casual')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    tone === 'casual'
                      ? 'bg-zinc-800 dark:bg-zinc-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  Casual
                </button>
              </div>
            </div>
          )}

          {/* Prompt */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {contentType === 'linkedin' ? 'Topic / Idea' : 'Key Points / Topic'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg
                         bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder={
                contentType === 'linkedin'
                  ? 'e.g., The importance of shipping fast and iterating'
                  : 'e.g., Q4 progress: launched new feature, hit 10K users, raising Series A'
              }
            />
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400
                       text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                          rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Generated Content
              </h2>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {result.sourceChunks} source chunks used
              </span>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {result.content}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
