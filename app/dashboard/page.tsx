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

  const activeStyle = {
    background: 'var(--text-primary)',
    color: 'white',
  };

  const inactiveStyle = {
    color: 'var(--text-secondary)',
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <main className="max-w-3xl mx-auto">
        {/* Dev Mode Notice */}
        <div
          className="rounded-2xl p-5 mb-10"
          style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">🔧</span>
            <div>
              <h3
                className="font-semibold text-base mb-1"
                style={{ fontFamily: 'var(--font-outfit)', color: '#92400e' }}
              >
                Dev Mode: Manual Testing Interface
              </h3>
              <p style={{ color: '#a16207', fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem' }}>
                This page allows direct API testing with manual userId input.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
          >
            Dashboard
          </h1>
          <p
            className="text-lg"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
          >
            Generate content in your authentic voice using RAG-powered AI
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} className="glass-card rounded-2xl p-8 mb-10">
          {/* User ID */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
            >
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="glass-input w-full px-5 py-3 rounded-xl text-base"
              placeholder="e.g., demo_founder"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            />
          </div>

          {/* Content Type */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
            >
              Content Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['linkedin', 'investor', 'general'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setContentType(type)}
                  className="py-3 px-4 rounded-xl font-medium text-sm transition-all glass-card"
                  style={{
                    fontFamily: 'var(--font-outfit)',
                    ...(contentType === type ? activeStyle : inactiveStyle),
                  }}
                >
                  {type === 'linkedin' ? 'LinkedIn Post' : type === 'investor' ? 'Investor Update' : 'General'}
                </button>
              ))}
            </div>
          </div>

          {/* Tone (only for LinkedIn) */}
          {contentType === 'linkedin' && (
            <div className="mb-6">
              <label
                className="block text-sm font-medium mb-3"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
              >
                Tone
              </label>
              <div className="flex gap-3">
                {(['professional', 'casual'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className="flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all glass-card"
                    style={{
                      fontFamily: 'var(--font-outfit)',
                      ...(tone === t ? activeStyle : inactiveStyle),
                    }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
            >
              {contentType === 'linkedin' ? 'Topic / Idea' : contentType === 'investor' ? 'Key Points / Topic' : 'Topic / Idea'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="glass-input w-full px-5 py-4 rounded-xl resize-y text-base"
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
          <button type="submit" disabled={loading} className="btn-generate">
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate Content'
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-5 mb-8" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <p style={{ color: '#dc2626', fontFamily: 'var(--font-dm-sans)', fontSize: '0.9375rem' }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2
                className="text-2xl font-semibold"
                style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
              >
                Generated Content
              </h2>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', fontFamily: 'var(--font-dm-sans)' }}
              >
                {result.sourceChunks} chunks used
              </span>
            </div>

            <div
              className="mb-8 leading-relaxed"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.9375rem',
                whiteSpace: 'pre-wrap'
              }}
            >
              {result.content}
            </div>

            {/* Metadata */}
            <div className="pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="block text-sm mb-1" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)' }}>
                    User ID
                  </span>
                  <span
                    className="font-mono text-sm px-2 py-1 rounded-md inline-block"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    {result.userId}
                  </span>
                </div>
                <div>
                  <span className="block text-sm mb-1" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)' }}>
                    Content Type
                  </span>
                  <span
                    className="font-mono text-sm px-2 py-1 rounded-md inline-block"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    {result.contentType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home Link */}
        <div className="mt-10 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 glass-card rounded-xl text-sm font-medium transition-all"
            style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--accent)', textDecoration: 'none' }}
          >
            <span>←</span>
            Back to Homepage
          </a>
        </div>
      </main>
    </div>
  );
}
