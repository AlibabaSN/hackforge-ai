'use client';
import { useEffect, useState } from 'react';
import { Bot, Cpu, Activity, Zap, Server, Sliders, Play } from 'lucide-react';
import Header from '../../components/Header';
import AuthModal from '../../components/AuthModal';
import LLMSettingsModal from '../../components/LLMSettingsModal';
import ThreeDBackgroundCanvas from '../../components/ThreeDBackgroundCanvas';
import ThreeDCard from '../../components/ThreeDCard';
import { getApiBase } from '@/lib/api';

const API = getApiBase();

export default function ModelsPage() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLLMModal, setShowLLMModal] = useState(false);

  const [models, setModels] = useState<any[]>([]);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debating, setDebating] = useState(false);
  const [debateResult, setDebateResult] = useState<any>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  async function fetchModels() {
    try {
      const res = await fetch(`${API}/models`);
      if (res.ok) {
        setModels(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function runBenchmark() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/models/benchmark`, { method: 'POST' });
      if (res.ok) {
        setBenchmarks(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function triggerDebate() {
    setDebating(true);
    try {
      const res = await fetch(`${API}/models/debate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: 'Design a high-throughput real-time AI inference pipeline with sub-10ms latency.' })
      });
      if (res.ok) {
        setDebateResult(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDebating(false);
    }
  }

  return (
    <div className="app-container">
      {/* 3D Background */}
      <ThreeDBackgroundCanvas />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Bot size={22} />
          </div>
          <div>
            <div className="brand-title">HackForge AI</div>
            <div className="brand-tag">Model Mesh Dashboard</div>
          </div>
        </div>

        <nav className="nav-menu">
          <a href="/" className="nav-item"><Cpu size={17} /> Workspace</a>
          <a href="/agents" className="nav-item"><Bot size={17} /> Agent Team (16)</a>
          <a href="/servers" className="nav-item"><Server size={17} /> AI Server Control</a>
          <a href="/models" className="nav-item active"><Sliders size={17} /> Model Control Center</a>
          <a href="/models/compare" className="nav-item"><Activity size={17} /> Model Comparison</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Header 
          user={user} 
          onOpenAuth={() => setShowAuthModal(true)} 
          onOpenLLMSettings={() => setShowLLMModal(true)}
          onLogout={() => setUser(null)}
          onNewProject={() => window.location.href = '/'}
          activeProjectTitle="Model Control Center"
        />

        <div className="dashboard-body">
          <div className="hero-banner">
            <div>
              <div className="hero-tag">
                <Activity size={14} /> MULTI-MODEL AGENT MESH CONTROL CENTER
              </div>
              <h1>Model Mesh Registry</h1>
              <div className="muted">
                Manage, benchmark, and orchestrate open-weight models (Qwen3, Llama 3.3, Mistral, DeepSeek, Gemma, Phi).
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={runBenchmark} disabled={loading}>
                <Zap size={16} /> {loading ? 'Benchmarking...' : 'Benchmark All Models'}
              </button>
              <button className="btn btn-primary" onClick={triggerDebate} disabled={debating}>
                <Play size={16} /> {debating ? 'Running Debate...' : 'Trigger Model Debate'}
              </button>
            </div>
          </div>

          {/* Model Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 28 }}>
            {models.map((m) => (
              <ThreeDCard key={m.model_name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{m.name}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{m.model_name}</div>
                  </div>
                  <span className={`status-badge ${m.status === 'HEALTHY' ? 'done' : m.status === 'UNCONFIGURED' ? 'queued' : 'failed'}`}>
                    {m.status}
                  </span>
                </div>

                <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>
                  Provider: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{m.provider}</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {m.capabilities.map((cap: string) => (
                    <span key={cap} className="tab-btn" style={{ padding: '3px 8px', fontSize: 10 }}>
                      {cap}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 12, fontSize: 12 }}>
                  <span className="muted">Latency: <strong>{m.latency_ms} ms</strong></span>
                  <span className="muted">Endpoints: <strong>{m.is_configured ? 'Active' : 'Offline Demo'}</strong></span>
                </div>
              </ThreeDCard>
            ))}
          </div>

          {/* Benchmark Results */}
          {benchmarks.length > 0 && (
            <ThreeDCard style={{ marginBottom: 28 }}>
              <div className="card-title">
                <span>Empirical Model Benchmark Matrix</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {benchmarks.map((b) => (
                  <div key={b.model_name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-dark)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{b.model_name}</div>
                      <div className="muted" style={{ fontSize: 11 }}>{b.provider}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <span className="muted" style={{ fontSize: 12 }}>Latency: <strong>{b.latency_ms} ms</strong></span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-emerald)' }}>{b.score}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </ThreeDCard>
          )}

          {/* Debate Result Box */}
          {debateResult && (
            <ThreeDCard>
              <div className="card-title">
                <span>Multi-Model Debate Verdict</span>
                <span className="muted" style={{ fontSize: 12 }}>Judge Model: {debateResult.judge_model}</span>
              </div>
              <pre className="artifact-box">
                {JSON.stringify(debateResult, null, 2)}
              </pre>
            </ThreeDCard>
          )}
        </div>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={() => {}} apiBase={API} />
      <LLMSettingsModal isOpen={showLLMModal} onClose={() => setShowLLMModal(false)} apiBase={API} />
    </div>
  );
}
