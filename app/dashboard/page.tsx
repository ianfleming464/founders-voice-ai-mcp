'use client';

import { useState } from 'react';

interface GenerationResponse {
  content: string;
  sourceChunks: number;
  userId: string;
  contentType: string;
  prompt: string;
}

export default function DashboardPage() {
  const [userId, setUserId] = useState('paul_graham');
  const [contentType, setContentType] = useState<'linkedin' | 'investor' | 'general'>('general');
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
    <div className="min-h-screen relative py-12 px-4">
      <main className="max-w-5xl mx-auto relative z-10">
        {/* Dev Mode Notice */}
        <div
          className="glass-card rounded-3xl p-6 mb-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 157, 0, 0.1), rgba(255, 100, 0, 0.08))',
            border: '1px solid rgba(255, 157, 0, 0.3)'
          }}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">🔧</span>
            <div>
              <h3
                className="font-semibold text-xl mb-2"
                style={{
                  fontFamily: 'var(--font-outfit)',
                  color: 'rgba(255, 200, 100, 1)'
                }}
              >
                Dev Mode: Manual Testing Interface
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.9rem'
              }}>
                This page allows direct API testing with manual userId input. Authentication and user profiles coming in Week 3.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold mb-4 text-glow-purple"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            Dashboard
          </h1>
          <p
            className="text-xl"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'var(--font-dm-sans)'
            }}
          >
            Generate content in your authentic voice using RAG-powered AI
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="glass-card rounded-3xl p-10 mb-10">
          {/* User ID */}
          <div className="mb-8">
            <label
              className="block text-sm font-medium mb-3"
              style={{
                color: 'var(--glass-white)',
                fontFamily: 'var(--font-dm-sans)'
              }}
            >
              User ID
              <span
                className="ml-2 text-xs"
                style={{ color: 'rgba(255, 255, 255, 0.5)' }}
              >
                (Will be auto-filled after auth in Week 3)
              </span>
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="glass-input w-full px-6 py-4 rounded-2xl text-lg"
              placeholder="e.g., paul_graham, demo_founder"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            />
          </div>

          {/* Content Type */}
          <div className="mb-8">
            <label
              className="block text-sm font-medium mb-4"
              style={{
                color: 'var(--glass-white)',
                fontFamily: 'var(--font-dm-sans)'
              }}
            >
              Content Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setContentType('linkedin')}
                className={`py-4 px-6 rounded-2xl font-medium transition-all duration-300 ${
                  contentType === 'linkedin' ? 'neon-glow-purple' : 'glass-card'
                }`}
                style={{
                  fontFamily: 'var(--font-outfit)',
                  background: contentType === 'linkedin'
                    ? 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))'
                    : undefined,
                  color: contentType === 'linkedin' ? 'var(--glass-white)' : 'rgba(255, 255, 255, 0.7)'
                }}
              >
                LinkedIn Post
              </button>
              <button
                type="button"
                onClick={() => setContentType('investor')}
                className={`py-4 px-6 rounded-2xl font-medium transition-all duration-300 ${
                  contentType === 'investor' ? 'neon-glow-cyan' : 'glass-card'
                }`}
                style={{
                  fontFamily: 'var(--font-outfit)',
                  background: contentType === 'investor'
                    ? 'linear-gradient(135deg, var(--cyan-glow), var(--royal-purple))'
                    : undefined,
                  color: contentType === 'investor' ? 'var(--glass-white)' : 'rgba(255, 255, 255, 0.7)'
                }}
              >
                Investor Update
              </button>
              <button
                type="button"
                onClick={() => setContentType('general')}
                className={`py-4 px-6 rounded-2xl font-medium transition-all duration-300 ${
                  contentType === 'general' ? 'neon-glow-emerald' : 'glass-card'
                }`}
                style={{
                  fontFamily: 'var(--font-outfit)',
                  background: contentType === 'general'
                    ? 'linear-gradient(135deg, var(--emerald-glow), var(--cyan-glow))'
                    : undefined,
                  color: contentType === 'general' ? 'var(--glass-white)' : 'rgba(255, 255, 255, 0.7)'
                }}
              >
                General
              </button>
            </div>
          </div>

          {/* Tone (only for LinkedIn) */}
          {contentType === 'linkedin' && (
            <div className="mb-8">
              <label
                className="block text-sm font-medium mb-4"
                style={{
                  color: 'var(--glass-white)',
                  fontFamily: 'var(--font-dm-sans)'
                }}
              >
                Tone
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTone('professional')}
                  className={`flex-1 py-3 px-6 rounded-2xl font-medium transition-all duration-300 ${
                    tone === 'professional' ? 'neon-glow-purple' : 'glass-card'
                  }`}
                  style={{
                    fontFamily: 'var(--font-outfit)',
                    background: tone === 'professional'
                      ? 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))'
                      : undefined,
                    color: tone === 'professional' ? 'var(--glass-white)' : 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  Professional
                </button>
                <button
                  type="button"
                  onClick={() => setTone('casual')}
                  className={`flex-1 py-3 px-6 rounded-2xl font-medium transition-all duration-300 ${
                    tone === 'casual' ? 'neon-glow-purple' : 'glass-card'
                  }`}
                  style={{
                    fontFamily: 'var(--font-outfit)',
                    background: tone === 'casual'
                      ? 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))'
                      : undefined,
                    color: tone === 'casual' ? 'var(--glass-white)' : 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  Casual
                </button>
              </div>
            </div>
          )}

          {/* Prompt */}
          <div className="mb-8">
            <label
              className="block text-sm font-medium mb-3"
              style={{
                color: 'var(--glass-white)',
                fontFamily: 'var(--font-dm-sans)'
              }}
            >
              {contentType === 'linkedin' ? 'Topic / Idea' : contentType === 'investor' ? 'Key Points / Topic' : 'Topic / Idea'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="glass-input w-full px-6 py-4 rounded-2xl resize-y text-lg"
              placeholder={
                contentType === 'linkedin'
                  ? 'e.g., The importance of shipping fast and iterating'
                  : contentType === 'investor'
                  ? 'e.g., Q4 progress: launched new feature, hit 10K users, raising Series A'
                  : 'e.g., Why startups should focus on making something people want'
              }
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            />
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed neon-glow-purple"
            style={{
              fontFamily: 'var(--font-outfit)',
              background: loading
                ? 'rgba(255, 255, 255, 0.1)'
                : 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))',
              color: 'var(--glass-white)',
              fontSize: '1.125rem'
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Generating...
              </span>
            ) : (
              'Generate Content'
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="glass-card rounded-2xl p-6 mb-8 border-red-500/30">
            <p style={{ color: '#ff6b6b', fontFamily: 'var(--font-dm-sans)' }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="glass-card rounded-3xl p-10">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
              <h2
                className="text-3xl font-semibold text-glow-cyan"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Generated Content
              </h2>
              <span
                className="px-4 py-2 rounded-full glass-card text-sm font-medium"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  color: 'var(--cyan-glow)'
                }}
              >
                {result.sourceChunks} chunks used
              </span>
            </div>

            <div
              className="mb-8 leading-relaxed"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '1.05rem',
                whiteSpace: 'pre-wrap'
              }}
            >
              {result.content}
            </div>

            {/* Metadata */}
            <div className="pt-6 border-t border-white/10">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span
                    className="block text-sm mb-2"
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontFamily: 'var(--font-dm-sans)'
                    }}
                  >
                    User ID
                  </span>
                  <span
                    className="font-mono px-3 py-1 rounded-lg glass-card inline-block"
                    style={{
                      color: 'var(--glass-white)',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.9rem'
                    }}
                  >
                    {result.userId}
                  </span>
                </div>
                <div>
                  <span
                    className="block text-sm mb-2"
                    style={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontFamily: 'var(--font-dm-sans)'
                    }}
                  >
                    Content Type
                  </span>
                  <span
                    className="font-mono px-3 py-1 rounded-lg glass-card inline-block"
                    style={{
                      color: 'var(--glass-white)',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.9rem'
                    }}
                  >
                    {result.contentType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home Link */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:neon-glow-cyan"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              color: 'var(--cyan-glow)',
              textDecoration: 'none'
            }}
          >
            <span>←</span>
            Back to Homepage
          </a>
        </div>
      </main>
    </div>
  );
}
