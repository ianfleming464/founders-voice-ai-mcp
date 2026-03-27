'use client';

import { useState } from 'react';

interface GenericResponse {
  content: string;
}

interface RAGResponse {
  content: string;
  sourceChunks: number;
  userId: string;
  contentType: string;
  prompt: string;
}

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [genericResult, setGenericResult] = useState<GenericResponse | null>(null);
  const [ragResult, setRAGResult] = useState<RAGResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    setGenericResult(null);
    setRAGResult(null);

    try {
      const [genericResponse, ragResponse] = await Promise.all([
        fetch('/api/generate-generic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: prompt.trim() }),
        }),
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'paul_graham',
            contentType: 'general',
            prompt: prompt.trim(),
            tone: 'professional',
          }),
        }),
      ]);

      const [genericData, ragData] = await Promise.all([
        genericResponse.json(),
        ragResponse.json(),
      ]);

      if (!genericResponse.ok) {
        setError(`Generic AI error: ${genericData.error || 'Failed to generate'}`);
        return;
      }

      if (!ragResponse.ok) {
        setError(`RAG error: ${ragData.error || 'Failed to generate'}`);
        return;
      }

      setGenericResult(genericData);
      setRAGResult(ragData);
    } catch (err) {
      setError('Network error - please try again');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* ── Navigation ──────────────────────────── */}
      <nav className="nav">
        <div className="nav-inner">
          <span className="nav-brand">
            <div
              className="w-6 h-6 rounded-md shrink-0"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)' }}
            />
            FounderVoiceAI
          </span>
          <div className="nav-links">
            <a href="#demo" className="nav-link">Demo</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#tech" className="nav-link">Tech Stack</a>
            <button onClick={scrollToDemo} className="nav-cta">Try It Free</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6 pt-28 pb-20 text-center">
        <div className="badge mb-8">
          <span className="badge-dot" />
          Currently in beta
        </div>

        <h1
          className="text-5xl sm:text-6xl md:text-[4.5rem] leading-[1.08] font-bold mb-8 tracking-tight"
          style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
        >
          Your Voice, Accessible
          <br />
          to <span className="gradient-text">Any AI Assistant</span>
        </h1>

        <p
          className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
        >
          RAG-powered voice cloning for startup founders. Generate authentic content
          that sounds like you — directly from your AI assistant.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button onClick={scrollToDemo} className="btn-primary">
            Try the Demo
          </button>
          <a href="#how-it-works" className="btn-secondary" style={{ textDecoration: 'none' }}>
            See How It Works
          </a>
        </div>
      </section>

      {/* ── Tech Stack Bar ──────────────────────── */}
      <section className="tech-bar">
        <div className="max-w-[1200px] mx-auto px-6">
          <p
            className="text-center mb-6 text-sm"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
          >
            Built with
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <span className="tech-item">Next.js</span>
            <span className="tech-item">OpenAI</span>
            <span className="tech-item">Pinecone</span>
            <span className="tech-item">MCP</span>
            <span className="tech-item">TypeScript</span>
          </div>
        </div>
      </section>

      {/* ── Demo Section ────────────────────────── */}
      <section id="demo" className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="section-label">Live Demo</span>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
            style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
          >
            See the Difference
          </h2>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
          >
            Compare standard AI output vs RAG-powered voice cloning
          </p>
        </div>

        {/* Demo Form */}
        <form
          onSubmit={handleGenerate}
          className="glass-card rounded-2xl p-8 mb-12 max-w-3xl mx-auto"
        >
          <div className="mb-5">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
            >
              Enter a topic or idea
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="glass-input w-full px-5 py-4 rounded-xl resize-none text-base"
              placeholder="e.g., The importance of shipping fast and iterating"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-generate">
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate Comparison'
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-5 mb-8 max-w-3xl mx-auto"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <p style={{ color: '#dc2626', fontFamily: 'var(--font-dm-sans)', fontSize: '0.9375rem' }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {(genericResult || ragResult) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Generic AI */}
            <div className="result-card">
              <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
                >
                  AI
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
                  >
                    Generic AI
                  </h3>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', fontFamily: 'var(--font-dm-sans)' }}>
                    Standard GPT-4 · No retrieval
                  </p>
                </div>
              </div>
              {genericResult ? (
                <div
                  className="leading-relaxed text-[0.9375rem]"
                  style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)', whiteSpace: 'pre-wrap' }}
                >
                  {genericResult.content}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* RAG Voice */}
            <div className="result-card-rag">
              <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid rgba(13, 148, 136, 0.12)' }}>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}
                >
                  FV
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
                  >
                    FounderVoiceAI
                  </h3>
                  <p style={{ color: 'var(--accent)', fontSize: '0.8125rem', fontFamily: 'var(--font-dm-sans)' }}>
                    {ragResult
                      ? `RAG-powered · ${ragResult.sourceChunks} source chunks`
                      : 'RAG-powered voice cloning'}
                  </p>
                </div>
              </div>
              {ragResult ? (
                <div
                  className="leading-relaxed text-[0.9375rem]"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-dm-sans)', whiteSpace: 'pre-wrap' }}
                >
                  {ragResult.content}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48">
                  <div className="w-6 h-6 border-2 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!genericResult && !ragResult && !loading && (
          <div className="glass-card rounded-2xl p-8 max-w-3xl mx-auto">
            <h3
              className="font-semibold text-lg mb-5"
              style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
            >
              How this demo works
            </h3>
            <div className="space-y-4" style={{ fontFamily: 'var(--font-dm-sans)' }}>
              <div className="flex items-start gap-4">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
                >
                  1
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Left column</strong> — Standard GPT-4 with no context about the founder
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}
                >
                  2
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Right column</strong> — RAG pipeline retrieves relevant chunks from the founder&apos;s writing, then generates content in their voice
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}
                >
                  =
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  Both use the same prompt — the difference shows the power of RAG-based voice cloning
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── How It Works ────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="section-label">How It Works</span>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
              style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
            >
              Three Steps to Your Voice
            </h2>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
            >
              From raw writing samples to AI-generated content that sounds like you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="glass-card rounded-2xl p-8">
              <div className="step-number mb-6" style={{ background: 'var(--text-primary)' }}>
                1
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
              >
                Train Your Voice
              </h3>
              <p
                className="mb-4 text-[0.9375rem] leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
              >
                Upload 100,000+ words of your writing. RAG learns your authentic voice, vocabulary, and style patterns.
              </p>
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)' }}
              >
                Planned
              </span>
            </div>

            {/* Step 2 */}
            <div className="glass-card rounded-2xl p-8" style={{ borderColor: 'rgba(13, 148, 136, 0.2)' }}>
              <div className="step-number mb-6" style={{ background: 'var(--accent)' }}>
                2
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
              >
                Generate Content
              </h3>
              <p
                className="mb-4 text-[0.9375rem] leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
              >
                Create LinkedIn posts, investor updates, and more. Every piece sounds authentically like you.
              </p>
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: 'var(--accent-light)', color: 'var(--accent-text)', fontFamily: 'var(--font-dm-sans)' }}
              >
                Live — try demo above
              </span>
            </div>

            {/* Step 3 */}
            <div className="glass-card rounded-2xl p-8">
              <div className="step-number mb-6" style={{ background: 'var(--text-primary)' }}>
                3
              </div>
              <h3
                className="text-xl font-semibold mb-3"
                style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
              >
                Integrate with AI
              </h3>
              <p
                className="mb-4 text-[0.9375rem] leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
              >
                Use MCP to connect with Claude Desktop, Cursor, and any AI assistant. Generate in your voice, anywhere.
              </p>
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)' }}
              >
                Planned
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture Section ────────────────── */}
      <section id="tech" className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <span className="section-label">Under the Hood</span>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
            style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
          >
            RAG Architecture
          </h2>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}
          >
            How retrieval-augmented generation powers authentic voice cloning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4h12v12H4z" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M7 8h6M7 11h4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-outfit)' }}>
                Embedding
              </h3>
            </div>
            <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}>
              Writing samples are chunked and converted to 512-dimensional vectors using OpenAI&apos;s text-embedding-3-small model.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="3" stroke="var(--accent)" strokeWidth="1.5" />
                  <path d="M10 3v2M10 15v2M3 10h2M15 10h2" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-outfit)' }}>
                Retrieval
              </h3>
            </div>
            <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}>
              Pinecone performs similarity search to find the most relevant chunks from the founder&apos;s writing for each prompt.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 10l3 3 7-7" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-outfit)' }}>
                Generation
              </h3>
            </div>
            <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}>
              GPT-4 receives retrieved context plus a voice-matching system prompt to generate content in the founder&apos;s authentic style.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="8" width="5" height="9" rx="1" stroke="var(--accent)" strokeWidth="1.5" />
                  <rect x="12" y="3" width="5" height="14" rx="1" stroke="var(--accent)" strokeWidth="1.5" />
                  <path d="M8 12h4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-outfit)' }}>
                MCP Integration
              </h3>
            </div>
            <p className="text-[0.9375rem] leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-dm-sans)' }}>
              Expose voice generation as MCP tools so Claude Desktop, Cursor, or any compatible assistant can use it natively.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="footer mt-12 py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <span className="font-semibold text-base mb-3 block" style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}>
                FounderVoiceAI
              </span>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)' }}>
                RAG-powered voice cloning for startup founders. Generate authentic content via MCP.
              </p>
            </div>
            <div>
              <span className="font-semibold text-sm mb-3 block" style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-secondary)' }}>
                Product
              </span>
              <div className="space-y-2">
                <a href="#demo" className="block text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)', textDecoration: 'none' }}>Demo</a>
                <a href="#how-it-works" className="block text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)', textDecoration: 'none' }}>How It Works</a>
                <a href="#tech" className="block text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)', textDecoration: 'none' }}>Architecture</a>
              </div>
            </div>
            <div>
              <span className="font-semibold text-sm mb-3 block" style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-secondary)' }}>
                Stack
              </span>
              <div className="space-y-2">
                <p className="text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)' }}>Next.js 16</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)' }}>OpenAI GPT-4</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)' }}>Pinecone</p>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)' }}>Model Context Protocol</p>
              </div>
            </div>
          </div>
          <div
            className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)' }}>
              FounderVoiceAI
            </p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-dm-sans)' }}>
              Built with Next.js, OpenAI, Pinecone, and MCP
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
