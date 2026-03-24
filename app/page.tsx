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
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center relative z-10">
        <div className="mb-12">
          <h1
            className="text-6xl md:text-7xl font-bold mb-6 text-glow-purple"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            Your Voice, Accessible to
            <br />
            <span
              className="text-glow-cyan"
              style={{
                background: 'linear-gradient(135deg, var(--cyan-glow), var(--emerald-glow))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Any AI Assistant
            </span>
          </h1>
          <p
            className="text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontFamily: 'var(--font-dm-sans)'
            }}
          >
            Voice cloning for startup founders using RAG architecture. Generate authentic content
            that sounds like you, directly from your AI assistant.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={scrollToDemo}
            className="px-10 py-5 font-semibold rounded-2xl transition-all duration-300 hover:scale-105 neon-glow-purple"
            style={{
              fontFamily: 'var(--font-outfit)',
              background: 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))',
              color: 'var(--glass-white)',
              fontSize: '1.125rem'
            }}
          >
            Try the Demo
          </button>
        </div>

        <div
          className="mt-8 inline-flex gap-3 items-center px-6 py-3 glass-card rounded-full"
          style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.875rem' }}
        >
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Currently in beta
          </span>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="max-w-7xl mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2
            className="text-5xl font-bold mb-4 text-glow-emerald"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            See the Difference
          </h2>
          <p
            className="text-xl"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'var(--font-dm-sans)'
            }}
          >
            Compare standard AI vs authentic voice cloning powered by RAG
          </p>
        </div>

        {/* Demo Form */}
        <form onSubmit={handleGenerate} className="glass-card rounded-3xl p-8 mb-12 max-w-4xl mx-auto">
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-3"
              style={{
                color: 'var(--glass-white)',
                fontFamily: 'var(--font-dm-sans)'
              }}
            >
              Enter your topic or idea
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="glass-input w-full px-6 py-4 rounded-2xl resize-none text-lg"
              placeholder="e.g., The importance of shipping fast and iterating"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed neon-glow-cyan"
            style={{
              fontFamily: 'var(--font-outfit)',
              background: loading
                ? 'rgba(255, 255, 255, 0.1)'
                : 'linear-gradient(135deg, var(--cyan-glow), var(--royal-purple))',
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
              'Generate Comparison'
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="glass-card rounded-2xl p-6 mb-8 max-w-4xl mx-auto border-red-500/30">
            <p style={{ color: '#ff6b6b', fontFamily: 'var(--font-dm-sans)' }}>{error}</p>
          </div>
        )}

        {/* Results - Side by Side */}
        {(genericResult || ragResult) && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Generic AI Column */}
              <div className="glass-card rounded-3xl p-8">
                <div className="mb-6">
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{
                      fontFamily: 'var(--font-outfit)',
                      color: 'var(--glass-white)'
                    }}
                  >
                    Generic AI
                  </h3>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem'
                  }}>
                    Standard GPT-4 • No retrieval • No context
                  </p>
                </div>
                {genericResult ? (
                  <div
                    className="leading-relaxed"
                    style={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontFamily: 'var(--font-dm-sans)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {genericResult.content}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* RAG Voice Column */}
              <div
                className="rounded-3xl p-8"
                style={{
                  background: '#1a1025',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(0, 212, 255, 0.15)'
                }}
              >
                <div className="mb-6">
                  <h3
                    className="text-2xl font-bold mb-2 text-glow-cyan"
                    style={{ fontFamily: 'var(--font-outfit)' }}
                  >
                    Founder Voice (RAG)
                  </h3>
                  <p style={{
                    color: 'rgba(0, 212, 255, 0.9)',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.875rem'
                  }}>
                    {ragResult
                      ? `Powered by ${ragResult.sourceChunks} retrieved source chunks`
                      : 'RAG-powered voice cloning'}
                  </p>
                </div>
                {ragResult ? (
                  <div
                    className="leading-relaxed"
                    style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontFamily: 'var(--font-dm-sans)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {ragResult.content}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

          </>
        )}

        {/* Instructions */}
        {!genericResult && !ragResult && !loading && (
          <div className="glass-card rounded-3xl p-8 max-w-4xl mx-auto">
            <h3
              className="font-semibold text-xl mb-4"
              style={{
                fontFamily: 'var(--font-outfit)',
                color: 'var(--glass-white)'
              }}
            >
              How this demo works:
            </h3>
            <ul
              className="space-y-3"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-dm-sans)'
              }}
            >
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--cyan-glow)' }}>•</span>
                <span><strong style={{ color: 'var(--glass-white)' }}>Left (Generic AI):</strong> Standard GPT-4 with no context about the founder</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--emerald-glow)' }}>•</span>
                <span><strong style={{ color: 'var(--glass-white)' }}>Right (Founder Voice):</strong> RAG pipeline retrieves relevant chunks from the founder&apos;s writing, then generates content matching their voice</span>
              </li>
              <li className="flex items-start gap-3">
                <span style={{ color: 'var(--deep-purple)' }}>•</span>
                <span>Both use the same prompt - the difference shows the power of RAG-based voice cloning</span>
              </li>
            </ul>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2
            className="text-5xl font-bold mb-4 text-glow-purple"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            How It Works
          </h2>
          <p
            className="text-xl"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'var(--font-dm-sans)'
            }}
          >
            Three simple steps to voice cloning with AI infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="glass-card rounded-3xl p-8 text-center group hover:neon-glow-purple">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))',
                boxShadow: '0 0 30px rgba(107, 45, 255, 0.4)'
              }}
            >
              <span
                className="text-3xl font-bold"
                style={{
                  fontFamily: 'var(--font-outfit)',
                  color: 'var(--glass-white)'
                }}
              >
                1
              </span>
            </div>
            <h3
              className="text-2xl font-semibold mb-4"
              style={{
                fontFamily: 'var(--font-outfit)',
                color: 'var(--glass-white)'
              }}
            >
              Train Your Voice
            </h3>
            <p
              className="mb-3"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-dm-sans)'
              }}
            >
              Paste 1,000+ words of your writing. We use RAG to learn your authentic voice, vocabulary, and style.
            </p>
            <p style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem'
            }}>
              Planned
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card rounded-3xl p-8 text-center group hover:neon-glow-cyan">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'linear-gradient(135deg, var(--cyan-glow), var(--royal-purple))',
                boxShadow: '0 0 30px rgba(0, 212, 255, 0.4)'
              }}
            >
              <span
                className="text-3xl font-bold"
                style={{
                  fontFamily: 'var(--font-outfit)',
                  color: 'var(--glass-white)'
                }}
              >
                2
              </span>
            </div>
            <h3
              className="text-2xl font-semibold mb-4"
              style={{
                fontFamily: 'var(--font-outfit)',
                color: 'var(--glass-white)'
              }}
            >
              Generate Content
            </h3>
            <p
              className="mb-3"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-dm-sans)'
              }}
            >
              Create LinkedIn posts, investor updates, and more. Every piece sounds authentically like you.
            </p>
            <p style={{
              color: 'var(--cyan-glow)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              Live demo above
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card rounded-3xl p-8 text-center group hover:neon-glow-emerald">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'linear-gradient(135deg, var(--emerald-glow), var(--cyan-glow))',
                boxShadow: '0 0 30px rgba(0, 255, 157, 0.4)'
              }}
            >
              <span
                className="text-3xl font-bold"
                style={{
                  fontFamily: 'var(--font-outfit)',
                  color: 'var(--glass-white)'
                }}
              >
                3
              </span>
            </div>
            <h3
              className="text-2xl font-semibold mb-4"
              style={{
                fontFamily: 'var(--font-outfit)',
                color: 'var(--glass-white)'
              }}
            >
              Integrate with AI
            </h3>
            <p
              className="mb-3"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-dm-sans)'
              }}
            >
              Use MCP to connect with Claude Desktop, Cursor, and any AI assistant. Generate in your voice, anywhere.
            </p>
            <p style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem'
            }}>
              Planned
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 mt-32 py-12"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#120828'
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div
            className="flex flex-col md:flex-row justify-between items-center gap-4"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.875rem'
            }}
          >
            <p>Founders Voice AI - RAG-powered voice cloning</p>
            <p>Built with Next.js, OpenAI, Pinecone, and MCP</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
