'use client';
import { useEffect, useState } from 'react';
import { Bot, Cpu, Activity, Zap, Server, Sliders, Play, Download, CheckCircle2, RefreshCw } from 'lucide-react';
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

  // Local Open-Source Installed Models & Downloader State
  const [installedInfo, setInstalledInfo] = useState<any>(null);
  const [pullModelName, setPullModelName] = useState('qwen2.5-coder:1.5b');
  const [pulling, setPulling] = useState(false);
  const [pullMsg, setPullMsg] = useState('');

  useEffect(() => {
    fetchModels();
    fetchInstalled();
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

  async function fetchInstalled() {
    try {
      const res = await fetch(`${API}/models/installed`);
      if (res.ok) {
        setInstalledInfo(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handlePull(name?: string) {
    const target = name || pullModelName;
    if (!target) return;
    setPulling(true);
    setPullMsg(`Triggering background installation of ${target}...`);
    try {
      const res = await fetch(`${API}/models/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: target })
      });
      if (res.ok) {
        const data = await res.json();
        setPullMsg(data.message);
        setTimeout(fetchInstalled, 4000);
      } else {
        setPullMsg(`Installation request failed: HTTP ${res.status}`);
      }
    } catch (e: any) {
      setPullMsg(`Error: ${e.message}`);
    } finally {
      setPulling(false);
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
              <h1>Open-Source Model Center</h1>
              <div className="muted">
                Install, benchmark, and run local open-weight models (Qwen 2.5 Coder, DeepSeek-R1, Llama 3.3, Gemma 3, Mistral).
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

          {/* Local Open-Source Model Installer Card */}
          <ThreeDCard style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Download size={20} className="text-cyan-400" />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Local Open-Source Model Engine</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Runs 100% offline on your machine via Ollama daemon ({installedInfo?.base_url || 'http://localhost:11434'})
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  installedInfo?.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {installedInfo?.status === 'ONLINE' ? '● OLLAMA ONLINE' : '○ OFFLINE'}
                </span>
                <button className="btn btn-secondary" onClick={fetchInstalled} style={{ padding: '4px 10px', fontSize: 12 }}>
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>
            </div>

            {/* Installed Models list */}
            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 8 }}>
                CURRENTLY INSTALLED LOCAL MODELS:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {installedInfo?.models && installedInfo.models.length > 0 ? (
                  installedInfo.models.map((m: string) => (
                    <span key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>
                      <CheckCircle2 size={13} /> {m}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No local models detected. Click any model below to download.
                  </span>
                )}
              </div>
            </div>

            {/* Quick-Install 1-Click Chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)' }}>
                1-CLICK INSTALL OPEN-SOURCE MODELS:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { name: 'qwen2.5-coder:1.5b', label: 'Qwen 2.5 Coder (1.5B) — Ultra Fast Code AI' },
                  { name: 'deepseek-r1:1.5b', label: 'DeepSeek-R1 (1.5B) — Reasoning Engine' },
                  { name: 'llama3.2:1b', label: 'Meta Llama 3.2 (1B) — Lightweight General' },
                  { name: 'gemma3:4b', label: 'Google Gemma 3 (4B) — Reasoning & Code' }
                ].map((item) => (
                  <button
                    key={item.name}
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '6px 12px', fontFamily: 'monospace' }}
                    onClick={() => handlePull(item.name)}
                    disabled={pulling}
                  >
                    <Download size={12} /> {item.label}
                  </button>
                ))}
              </div>

              {/* Custom Model Input */}
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <input 
                  type="text" 
                  className="search-input" 
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}
                  placeholder="Enter any Ollama model name (e.g. qwen2.5-coder:7b, mistral:7b)..."
                  value={pullModelName}
                  onChange={(e) => setPullModelName(e.target.value)}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={() => handlePull()} 
                  disabled={pulling}
                  style={{ minWidth: 140 }}
                >
                  <Download size={14} /> {pulling ? 'Installing...' : 'Install Model'}
                </button>
              </div>

              {pullMsg && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#67e8f9', fontFamily: 'monospace', background: 'rgba(6, 182, 212, 0.1)', padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                  ℹ️ {pullMsg}
                </div>
              )}
            </div>
          </ThreeDCard>

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
                  <div key={b.model} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <div>
                      <strong style={{ fontSize: 14 }}>{b.model}</strong>
                      <span className="muted" style={{ marginLeft: 10, fontSize: 12 }}>({b.provider})</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                      <span>Quality: <strong style={{ color: '#22d3ee' }}>{b.quality_score}/10</strong></span>
                      <span>Latency: <strong>{b.latency_ms} ms</strong></span>
                      <span>Est. Cost: <strong>${b.estimated_cost}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </ThreeDCard>
          )}

          {/* Debate Result */}
          {debateResult && (
            <ThreeDCard style={{ marginBottom: 28 }}>
              <div className="card-title">
                <span>Cross-Model Collaboration & Consensus Result</span>
              </div>
              <div style={{ background: 'rgba(5, 7, 13, 0.75)', padding: 16, borderRadius: 10, border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 }}>
                <div><strong>Consensus Status:</strong> <span style={{ color: '#34d399' }}>{debateResult.status}</span></div>
                <div style={{ marginTop: 8 }}><strong>Synthesis:</strong> {debateResult.consensus}</div>
                <div style={{ marginTop: 8 }}><strong>Confidence Score:</strong> {debateResult.confidence_score * 100}%</div>
              </div>
            </ThreeDCard>
          )}
        </div>
      </main>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onSuccess={(u) => setUser(u)} 
        apiBase={API}
      />
      <LLMSettingsModal 
        isOpen={showLLMModal} 
        onClose={() => setShowLLMModal(false)} 
        apiBase={API}
      />
    </div>
  );
}
